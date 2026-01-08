import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function cleanupDuplicates() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Finding duplicate crowdfunding assets...');

    // Get all crowdfunding assets
    const { data: assets, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'CROWDFUNDING')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching assets:', error);
        return;
    }

    // Group by portfolio_id + name
    const groups = new Map<string, any[]>();
    for (const asset of assets) {
        const key = `${asset.portfolio_id}::${asset.name}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(asset);
    }

    // Find duplicates and delete all but the most recent
    let deletedCount = 0;
    for (const [key, assetGroup] of groups) {
        if (assetGroup.length > 1) {
            console.log(`Found ${assetGroup.length} duplicates for: ${key}`);

            // Keep the last one (most recent), delete the rest
            const toDelete = assetGroup.slice(0, -1);
            for (const asset of toDelete) {
                console.log(`  Deleting: ${asset.id}`);
                const { error: delError } = await supabase
                    .from('assets')
                    .delete()
                    .eq('id', asset.id);

                if (delError) {
                    console.error(`  Error deleting ${asset.id}:`, delError);
                } else {
                    deletedCount++;
                }
            }
        }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicate(s).`);
}

cleanupDuplicates().catch(console.error);
