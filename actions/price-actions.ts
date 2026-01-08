'use server'

import { db } from "@/db"
import { assets } from "@/db/schema"
import { eq, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance();

export async function updateAllPrices() {
    try {
        // 1. Fetch all assets that have a symbol
        const allAssets = await db.select().from(assets).where(isNotNull(assets.symbol));

        let updatedCount = 0;
        let failedCount = 0;

        for (const asset of allAssets) {
            // Robust check: Skip empty symbols or those that look like JSON (crowdfunding metadata)
            if (!asset.symbol || asset.symbol.trim() === '' || asset.symbol.startsWith('{')) {
                continue;
            }

            try {
                // 2. Try to fetch price
                // Using 'any' to bypass partial type definitions in the library if necessary
                let quote: any;

                // First attempt: direct usage of symbol
                try {
                    const q: any = await yahooFinance.quote(asset.symbol);
                    quote = q;
                } catch (e) {
                    // Second attempt: Search if symbol looks like ISIN
                    // Simple heuristic: ISINs are 12 chars alphanumeric
                    if (asset.symbol.length === 12) {
                        const searchResult: any = await yahooFinance.search(asset.symbol);
                        if (searchResult.quotes && searchResult.quotes.length > 0) {
                            const ticker = searchResult.quotes[0].symbol;
                            console.log(`Resolved ISIN ${asset.symbol} to ticker ${ticker}`);
                            // Intentionally wait a bit to avoid rate limits if we do many searches
                            quote = await yahooFinance.quote(ticker);
                        }
                    }
                }

                if (quote && quote.regularMarketPrice) {
                    // 3. Update asset
                    await db.update(assets).set({
                        currentPrice: quote.regularMarketPrice.toString(),
                        updatedAt: new Date()
                    }).where(eq(assets.id, asset.id));
                    updatedCount++;
                } else {
                    console.warn(`No price found for ${asset.symbol}`);
                    failedCount++;
                }

            } catch (error) {
                console.error(`Failed to update price for ${asset.symbol}:`, error);
                failedCount++;
            }
        }

        revalidatePath('/portfolio');
        revalidatePath('/dashboard');
        revalidatePath('/portfolio/stocks-funds');

        return { success: true, updated: updatedCount, failed: failedCount };
    } catch (error) {
        console.error("Failed to update prices:", error);
        return { success: false, error: "Failed to update prices" };
    }
}
