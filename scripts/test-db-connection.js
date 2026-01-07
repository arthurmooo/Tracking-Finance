const postgres = require('postgres');

const ref = 'ohtujbkqwexdqzsdrkzh';
const pass = 'ryxHyz-1kupho-womcem';
const region = 'eu-central-1';

const configs = [
    {
        name: 'Direct (Standard)',
        url: `postgres://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`
    },
    {
        name: 'Pooler (Transaction Mode - IPv4 Host)',
        url: `postgres://postgres.${ref}:${pass}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
    },
    {
        name: 'Pooler (Session Mode - IPv4 Host - Experimental)',
        url: `postgres://postgres.${ref}:${pass}@aws-0-${region}.pooler.supabase.com:5432/postgres`
    }
];

async function test() {
    console.log('🔍 Testing Database Connections...\n');

    for (const config of configs) {
        console.log(`Testing: ${config.name}`);
        console.log(`URL: ${config.url.replace(pass, '****')}`);

        try {
            const sql = postgres(config.url, { connect_timeout: 5 });
            const result = await sql`SELECT 1 as connected`;
            console.log(`✅ SUCCESS! Connected via ${config.name}`);
            console.log('---------------------------------------------------\n');
            await sql.end();
            process.exit(0); // Exit on first success to be fast
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
            if (err.code) console.log(`   Code: ${err.code}`);
            if (err.address) console.log(`   Address: ${err.address}`);
            console.log('---------------------------------------------------\n');
        }
    }
}

test();
