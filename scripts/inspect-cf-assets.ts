
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function checkCrowdfundingAssets() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: assets, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'CROWDFUNDING');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${assets.length} crowdfunding assets.`);
    assets.forEach(a => {
        console.log(`--- Asset: ${a.name} ---`);
        console.log(`Symbol (Metadata):`, a.symbol);
        try {
            if (a.symbol) {
                const meta = JSON.parse(a.symbol);
                console.log(`Parsed Date: ${meta.startDate}`);
            }
        } catch (e) {
            console.log(`Failed to parse JSON`);
        }
    });
}

checkCrowdfundingAssets().catch(console.error);
