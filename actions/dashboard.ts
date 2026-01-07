import { db } from "@/db"
import { dailySnapshots, assets, portfolios } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function getDashboardData() {
    try {
        const results = await Promise.all([
            db.query.dailySnapshots.findMany({
                orderBy: [asc(dailySnapshots.date)],
                limit: 365
            }),
            db.query.assets.findMany(),
            db.query.portfolios.findMany()
        ]);

        return {
            snapshots: results[0] || [],
            assets: results[1] || [],
            portfolios: results[2] || []
        }

    } catch (error) {
        console.warn("⚠️ Database Error:", error);
        return {
            snapshots: [],
            assets: [],
            portfolios: []
        };
    }
}
