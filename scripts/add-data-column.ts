import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function addDataColumn() {
    console.log('🔍 Adding data column to daily_snapshots...');

    try {
        await db.execute(sql`ALTER TABLE daily_snapshots ADD COLUMN IF NOT EXISTS data jsonb;`);
        console.log('✅ Column data added successfully!');
    } catch (e: any) {
        if (e.message?.includes('already exists')) {
            console.log('✅ Column already exists, nothing to do.');
        } else {
            console.error('❌ Error:', e);
        }
    }

    await client.end();
    process.exit(0);
}

addDataColumn();
