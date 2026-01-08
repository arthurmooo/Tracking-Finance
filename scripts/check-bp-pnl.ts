import { db } from "./db";
import { assets } from "./db/schema";
import { eq } from "drizzle-orm";

async function checkBPAssets() {
    const results = await db.select().from(assets).where(eq(assets.type, "CROWDFUNDING"));
    console.log(`Found ${results.length} crowdfunding assets`);
    results.forEach(a => {
        const price = parseFloat(a.currentPrice || "0");
        const buy = parseFloat(a.averageBuyPrice || "0");
        const pnl = price - buy;
        if (pnl !== 0) {
            console.log(`- ${a.name}: Price=${price}, Buy=${buy}, PnD=${pnl} (${((pnl/buy)*100).toFixed(2)}%)`);
        }
    });
    const totalPnl = results.reduce((sum, a) => sum + (parseFloat(a.currentPrice||"0") - parseFloat(a.averageBuyPrice||"0")), 0);
    console.log(`Total PnL: ${totalPnl}`);
    process.exit(0);
}
checkBPAssets().catch(console.error);

