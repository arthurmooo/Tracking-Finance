'use server'

import { db } from "@/db"
import { assets, dailySnapshots, intradaySnapshots, portfolios } from "@/db/schema"
import { eq, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance();

// Helper: Check if string looks like an ISIN (2 letters + 10 alphanumeric)
function looksLikeIsin(str: string): boolean {
    return /^[A-Z]{2}[A-Z0-9]{10}$/.test(str);
}

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
                let quote: any = null;
                let ticker = asset.symbol;

                // If it looks like an ISIN, resolve it to a ticker first
                if (looksLikeIsin(asset.symbol)) {
                    console.log(`[ISIN detected] Searching for ${asset.symbol}...`);
                    try {
                        const searchResult: any = await yahooFinance.search(asset.symbol);
                        if (searchResult.quotes && searchResult.quotes.length > 0) {
                            ticker = searchResult.quotes[0].symbol;
                            console.log(`[ISIN resolved] ${asset.symbol} -> ${ticker}`);
                        } else {
                            console.warn(`[ISIN] No results for ${asset.symbol}`);
                            failedCount++;
                            continue;
                        }
                    } catch (searchErr) {
                        console.error(`[ISIN search error] ${asset.symbol}:`, searchErr);
                        failedCount++;
                        continue;
                    }
                }

                // Now fetch the quote using the resolved ticker
                try {
                    // Fetch price and summaryDetail for yield
                    const result = await yahooFinance.quoteSummary(ticker, { modules: ['price', 'summaryDetail'] });
                    quote = result.price;

                    if (quote && quote.regularMarketPrice) {
                        const updates: any = {
                            currentPrice: quote.regularMarketPrice.toString(),
                            updatedAt: new Date()
                        };

                        // Store dividend yield if available (decimal form, e.g. 0.02 for 2%)
                        // Use trailingAnnualDividendYield if regular yield is missing/null
                        const summary = result.summaryDetail;
                        if (summary) {
                            if (summary.dividendYield !== undefined && summary.dividendYield !== null) {
                                updates.dividendYield = summary.dividendYield.toString();
                            } else if (summary.trailingAnnualDividendYield !== undefined && summary.trailingAnnualDividendYield !== null) {
                                updates.dividendYield = summary.trailingAnnualDividendYield.toString();
                            } else {
                                // Explicit 0 if no yield found (e.g. accumulating ETF)
                                updates.dividendYield = "0";
                            }
                        }

                        // 3. Update asset
                        await db.update(assets).set(updates).where(eq(assets.id, asset.id));

                        console.log(`[Updated] ${asset.name}: ${quote.regularMarketPrice} ${quote.currency} (Yield: ${updates.dividendYield})`);
                        updatedCount++;
                    } else {
                        console.warn(`[No price] ${asset.symbol} (ticker: ${ticker})`);
                        failedCount++;
                    }
                } catch (quoteErr) {
                    console.error(`[Quote error] ${ticker}:`, quoteErr);
                    failedCount++;
                    continue;
                }

            } catch (error) {
                console.error(`[Error] ${asset.symbol}:`, error);
                failedCount++;
            }
        }

        // 4. Update History (Daily Snapshot)
        // Calculate total net worth for each user and save a snapshot
        const allPortfolios = await db.select().from(portfolios);
        const userPortfoliosMap = new Map<string, string[]>(); // userId -> portfolioIds[]

        for (const p of allPortfolios) {
            if (!userPortfoliosMap.has(p.userId)) {
                userPortfoliosMap.set(p.userId, []);
            }
            userPortfoliosMap.get(p.userId)?.push(p.id);
        }

        // Re-fetch all assets to get latest prices for calculation
        const currentAssets = await db.select().from(assets);

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        for (const [userId, portfolioIds] of userPortfoliosMap.entries()) {
            let totalNetWorth = 0;
            const breakdown: Record<string, number> = {
                stocks: 0,
                crowdfunding: 0,
                crypto: 0,
                other: 0
            };

            // Filter assets belonging to this user's portfolios
            const userAssets = currentAssets.filter(a => portfolioIds.includes(a.portfolioId));

            for (const asset of userAssets) {
                const price = parseFloat(asset.currentPrice || '0');
                const quantity = parseFloat(asset.quantity || '0');
                const value = price * quantity;
                totalNetWorth += value;

                // Identify category based on portfolio type
                // We need to look up the portfolio for this asset
                const portfolio = allPortfolios.find(p => p.id === asset.portfolioId);
                const type = portfolio?.type || 'UNKNOWN';

                if (['PEA', 'CTO', 'PEE', 'AV', 'STOCK', 'FUND', 'ETF'].includes(type)) {
                    breakdown.stocks += value;
                } else if (['CROWDLENDING', 'PARTICIPATORY', 'CROWDFUNDING'].includes(type)) {
                    breakdown.crowdfunding += value;
                } else if (['CRYPTO', 'BITCOIN'].includes(type)) {
                    breakdown.crypto += value;
                } else {
                    breakdown.other += value;
                }
            }

            // Check if snapshot exists for today
            const existingSnapshot = await db.query.dailySnapshots.findFirst({
                where: (snapshot, { and, eq }) => and(
                    eq(snapshot.userId, userId),
                    eq(snapshot.date, dateStr)
                )
            });

            if (existingSnapshot) {
                await db.update(dailySnapshots)
                    .set({
                        totalNetWorth: totalNetWorth.toString(),
                        data: breakdown
                    })
                    .where(eq(dailySnapshots.id, existingSnapshot.id));
                console.log(`[Snapshot] Updated for user ${userId}: ${totalNetWorth} EUR (Stocks: ${breakdown.stocks})`);
            } else {
                await db.insert(dailySnapshots).values({
                    userId: userId,
                    date: dateStr,
                    totalNetWorth: totalNetWorth.toString(),
                    currency: 'EUR',
                    data: breakdown
                });
                console.log(`[Snapshot] Created for user ${userId}: ${totalNetWorth} EUR (Stocks: ${breakdown.stocks})`);
            }

            // 5. Update Intraday Snapshot (Hourly)
            // Always insert a new point for granular history
            await db.insert(intradaySnapshots).values({
                userId: userId,
                timestamp: new Date(),
                totalNetWorth: totalNetWorth.toString(),
                currency: 'EUR',
                data: breakdown
            });
            console.log(`[Intraday] Saved snapshot for user ${userId} at ${new Date().toISOString()}`);

            // CLEANUP: Keep only last 30 days of intraday data to prevent bloat
            // const thirtyDaysAgo = new Date();
            // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            // await db.delete(intradaySnapshots)
            //     .where(and(
            //         eq(intradaySnapshots.userId, userId),
            //         lt(intradaySnapshots.timestamp, thirtyDaysAgo)
            //     ));
        }

        revalidatePath('/portfolio');
        revalidatePath('/dashboard');
        revalidatePath('/portfolio/stocks-funds');

        console.log(`=== Price update complete: ${updatedCount} updated, ${failedCount} failed ===`);
        return { success: true, updated: updatedCount, failed: failedCount };
    } catch (error) {
        console.error("Failed to update prices:", error);
        return { success: false, error: "Failed to update prices" };
    }
}
