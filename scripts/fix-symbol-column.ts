import { db } from "../db";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("Altering symbol column from varchar(20) to text...");
    await db.execute(sql`ALTER TABLE assets ALTER COLUMN symbol TYPE text`);
    console.log("Done!");
    process.exit(0);
}
migrate().catch(console.error);

