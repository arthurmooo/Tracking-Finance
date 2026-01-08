'use server'

import { db } from "@/db"
import { assets, transactions, portfolios } from "@/db/schema"
import { ParsedAsset } from "@/lib/csv-parsers"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function processImport(portfolioId: string, parsedAssets: ParsedAsset[]) {
    try {
        let importedCount = 0;
        let updatedCount = 0;

        // Note: In a real app we should verify user ownership of portfolioId here.
        // Assuming middleware/context handles auth, but we should double check if we had auth context.
        // For this MVP step, we trust the ID passed from the authorized UI.

        for (const asset of parsedAssets) {
            // 1. Try to find existing asset by NAME within portfolio (works for all types)
            // This ensures reimporting a CSV always updates existing assets, never duplicates
            let existingAsset = null;

            // Primary match: by name within portfolio
            const resultsByName = await db.select().from(assets).where(
                and(
                    eq(assets.portfolioId, portfolioId),
                    eq(assets.name, asset.name)
                )
            ).limit(1);
            existingAsset = resultsByName[0];

            // Secondary match: by symbol if no name match and symbol is valid (not JSON metadata)
            if (!existingAsset && asset.symbol && !asset.symbol.startsWith('{')) {
                const resultsBySymbol = await db.select().from(assets).where(
                    and(
                        eq(assets.portfolioId, portfolioId),
                        eq(assets.symbol, asset.symbol)
                    )
                ).limit(1);
                existingAsset = resultsBySymbol[0];
            }

            if (existingAsset) {
                // Update existing asset
                // For crowdfunding, also update symbol (metadata JSON)
                const updateData: any = {
                    quantity: asset.quantity.toString(),
                    currentPrice: asset.price?.toString() || existingAsset.currentPrice,
                    updatedAt: new Date()
                };

                // Update symbol/metadata for crowdfunding assets
                if (asset.type === 'CROWDFUNDING' && asset.symbol) {
                    updateData.symbol = asset.symbol;
                }

                await db.update(assets).set(updateData).where(eq(assets.id, existingAsset.id));
                updatedCount++;
            } else {
                // Insert new asset
                const buyPriceValue = asset.buyPrice?.toString() || asset.price?.toString() || "0";
                const symbolValue = asset.symbol || asset.isin || null;

                await db.insert(assets).values({
                    portfolioId: portfolioId,
                    name: asset.name,
                    symbol: symbolValue,
                    quantity: asset.quantity.toString(),
                    currentPrice: asset.price?.toString() || "0",
                    averageBuyPrice: buyPriceValue,
                    currency: asset.currency,
                    type: asset.type
                });
                importedCount++;
            }
        }

        revalidatePath('/portfolio');
        revalidatePath('/dashboard');

        return { success: true, imported: importedCount, updated: updatedCount };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: "Failed to process import" };
    }
}

export async function getPortfoliosList() {
    try {
        const result = await db.query.portfolios.findMany({
            columns: {
                id: true,
                name: true,
                type: true
            },
            orderBy: (portfolios, { asc }) => [asc(portfolios.name)]
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to fetch portfolios:", error);
        return { success: false, data: [] };
    }
}

export async function createPortfolio(name: string, type: string) {
    try {
        const user = await db.query.profiles.findFirst();
        if (!user) throw new Error("No user found");

        const [portfolio] = await db.insert(portfolios).values({
            userId: user.id,
            name: name,
            type: type,
        }).returning();

        revalidatePath('/import');
        revalidatePath('/portfolio');

        return { success: true, data: portfolio };
    } catch (error) {
        console.error("Failed to create portfolio:", error);
        return { success: false, error: "Failed to create portfolio" };
    }
}

export async function deletePortfolio(portfolioId: string) {
    try {
        // First delete all assets belonging to this portfolio
        await db.delete(assets).where(eq(assets.portfolioId, portfolioId));

        // Then delete the portfolio itself
        await db.delete(portfolios).where(eq(portfolios.id, portfolioId));

        revalidatePath('/import');
        revalidatePath('/portfolio');
        revalidatePath('/portfolio/stocks-funds');
        revalidatePath('/portfolio/participatory-financing');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to delete portfolio:", error);
        return { success: false, error: "Failed to delete portfolio" };
    }
}
