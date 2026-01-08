// Test script using Supabase client (REST API)
// Run with: npx tsx scripts/test-supabase-connection.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check profiles
    console.log('\n1. Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (profileError) {
        console.error('   ❌ Error fetching profiles:', profileError.message);
    } else {
        console.log(`   Found ${profiles?.length ?? 0} profile(s)`);
        if (profiles && profiles.length > 0) {
            console.log('   First profile:', profiles[0]);
        } else {
            console.log('   ⚠️  NO PROFILES! Creating one...');
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({ email: 'user@example.com', currency: 'EUR' })
                .select()
                .single();

            if (createError) {
                console.error('   ❌ Failed to create profile:', createError.message);
            } else {
                console.log('   ✅ Created profile:', newProfile);
            }
        }
    }

    // 2. Check portfolios
    console.log('\n2. Checking portfolios table...');
    const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (portfolioError) {
        console.error('   ❌ Error fetching portfolios:', portfolioError.message);
    } else {
        console.log(`   Found ${portfolios?.length ?? 0} portfolio(s)`);
        portfolios?.forEach(p => {
            console.log(`   - ${p.name} (${p.type}) [ID: ${p.id}]`);
        });
    }

    // 3. Check assets
    console.log('\n3. Checking assets table...');
    const { data: assets, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .limit(5);

    if (assetError) {
        console.error('   ❌ Error fetching assets:', assetError.message);
    } else {
        console.log(`   Found ${assets?.length ?? 0} asset(s)`);
    }

    console.log('\n✅ Test complete!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
