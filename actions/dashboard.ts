import { db } from "@/db"
import { dailySnapshots, assets, portfolios } from "@/db/schema"
import { asc } from "drizzle-orm"
import { demoData } from "@/lib/demo-data"

export async function getDashboardData() {
    try {
        // 1. Try fetching from Supabase (Live Mode)
        // Using a timeout to fail fast if network is stuck
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 3000));

        const dbPromise = Promise.all([
            db.query.dailySnapshots.findMany({
                orderBy: [asc(dailySnapshots.date)],
                limit: 365
            }),
            db.query.assets.findMany(),
            db.query.portfolios.findMany()
        ]);

        const results = await Promise.race([dbPromise, timeoutPromise]) as [typeof demoData.snapshots, any[], any[]];

        // Check if we actually got enough data or if tables are empty/sparse
        // We need at least 30 snapshots for proper time range filtering
        if (!results[0].length || results[0].length < 30 || !results[1].length) {
            console.warn(`⚠️ Database has insufficient data (${results[0].length} snapshots). Returning demo data.`);
            return transformDemoData();
        }

        return {
            snapshots: results[0],
            assets: results[1],
            portfolios: results[2]
        }

    } catch (error) {
        console.warn("⚠️ Using Offline Data (Connection Failed):", error);
        return transformDemoData();
    }
}

function transformDemoData() {
    return {
        snapshots: demoData.snapshots.map(s => ({
            ...s,
            totalNetWorth: s.netWorth.toString(),
        })),
        assets: demoData.assets.map(a => ({
            ...a,
            quantity: a.quantity.toString(),
            currentPrice: a.price.toString(),
            portfolioId: demoData.portfolios[a.portfolioIndex].id,
            portfolio: { name: demoData.portfolios[a.portfolioIndex].name }
        })),
        portfolios: demoData.portfolios
    }
}
