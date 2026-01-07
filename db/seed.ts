import { db } from './index';
import { profiles, institutions, portfolios, assets, dailySnapshots, transactions } from './schema';
import { demoData } from '@/lib/demo-data';

export async function seed() {
    console.log('🌱 Starting Seed...');

    // 1. Create Profile
    console.log('Creating User Profile...');
    const [user] = await db.insert(profiles).values(demoData.user).returning();

    // 2. Create Institutions
    console.log('Creating Institutions...');
    const insts = await db.insert(institutions).values(demoData.institutions).returning();

    // 3. Create Portfolios
    console.log('Creating Portfolios...');
    const portfoliosData = demoData.portfolios.map(p => ({
        userId: user.id,
        institutionId: insts[p.institutionIndex].id,
        name: p.name,
        type: p.type,
    }));
    const ports = await db.insert(portfolios).values(portfoliosData).returning();

    // 4. Create Assets
    console.log('Creating Assets...');
    const assetsData = demoData.assets.map(a => ({
        portfolioId: ports[a.portfolioIndex].id,
        name: a.name,
        symbol: a.symbol,
        quantity: a.quantity.toString(),
        currentPrice: a.price.toString(),
        averageBuyPrice: (a.price * 0.9).toString(), // Mock 10% gain
        type: a.type,
    }));

    await db.insert(assets).values(assetsData);

    // 5. Create Snapshots
    console.log('Creating Snapshots...');
    const snapshotsData = demoData.snapshots.map(s => ({
        userId: user.id,
        date: s.date,
        totalNetWorth: s.netWorth.toString(),
    }));
    await db.insert(dailySnapshots).values(snapshotsData);

    console.log('✅ Seed Complete!');
}
