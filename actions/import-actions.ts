'use server'

import { db } from "@/db"
import { assets, transactions } from "@/db/schema"
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
            // 1. Try to find existing asset
            // Match by Symbol if available, otherwise by Name
            let existingAsset = null;

            if (asset.symbol) {
                const results = await db.select().from(assets).where(
                    and(
                        eq(assets.portfolioId, portfolioId),
                        eq(assets.symbol, asset.symbol)
                    )
                ).limit(1);
                existingAsset = results[0];
            } else {
                const results = await db.select().from(assets).where(
                    and(
                        eq(assets.portfolioId, portfolioId),
                        eq(assets.name, asset.name)
                    )
                ).limit(1);
                existingAsset = results[0];
            }

            if (existingAsset) {
                // Update
                await db.update(assets).set({
                    quantity: asset.quantity.toString(), // Schema uses decimal/string
                    currentPrice: asset.price?.toString() || existingAsset.currentPrice,
                    updatedAt: new Date()
                }).where(eq(assets.id, existingAsset.id));
                updatedCount++;
            } else {
                // Insert
                await db.insert(assets).values({
                    portfolioId: portfolioId,
                    name: asset.name,
                    symbol: asset.symbol || null,
                    quantity: asset.quantity.toString(),
                    currentPrice: asset.price?.toString() || "0",
                    averageBuyPrice: asset.price?.toString() || "0", // Assume buy price = current price for new import
                    currency: asset.currency,
                    type: asset.type
                });
                importedCount++;

                // Optional: Create an initial transaction record?
                // skipping for now to keep it simple, straightforward import.
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
    } catch (error) {
        console.error("Failed to fetch portfolios:", error);
        return { success: false, data: [] };
    }
}

export async function createPortfolio(name: string, type: string) {
    try {
        const user = await db.query.profiles.findFirst();
        if (!user) throw new Error("No user found");

        const [portfolio] = await db.insert(db.query.portfolios.schema).values({
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
