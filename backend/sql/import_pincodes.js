/**
 * Pincode Import Script
 * 
 * 1. Adds twenty_ton_hydraulic column if missing
 * 2. Clears existing pincodes
 * 3. Imports all rows from CSV
 * 
 * Run: node backend/sql/import_pincodes.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importPincodes() {
    // Step 0: Add twenty_ton_hydraulic column if it doesn't exist
    console.log('🔧 Ensuring twenty_ton_hydraulic column exists...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
        query: "ALTER TABLE public.pincodes ADD COLUMN IF NOT EXISTS twenty_ton_hydraulic text DEFAULT '0';"
    }).maybeSingle();
    
    // If RPC doesn't exist, try direct SQL via REST (column may already exist)
    if (alterError) {
        console.log('⚠️  RPC not available, trying direct column add...');
        // Try inserting a test row with the column to check
        const { data: testData, error: testError } = await supabase
            .from('pincodes')
            .select('twenty_ton_hydraulic')
            .limit(1);
        
        if (testError && testError.message.includes('twenty_ton_hydraulic')) {
            console.error('❌ Column twenty_ton_hydraulic does not exist. Please run this SQL in Supabase dashboard:');
            console.error("   ALTER TABLE public.pincodes ADD COLUMN twenty_ton_hydraulic text DEFAULT '0';");
            console.log('\nAttempting to continue without it...');
        } else {
            console.log('✅ Column twenty_ton_hydraulic already exists.');
        }
    } else {
        console.log('✅ Column ready.');
    }

    // Step 1: Read CSV
    const csvPath = path.resolve(__dirname, 'pincodes_import.csv');
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').filter(l => l.trim());

    const headers = lines[0].split(',').map(h => h.trim());
    console.log('📋 Headers:', headers);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx];
        });

        if (!row.pincode || row.pincode.length < 6) continue;

        rows.push({
            city: row.city || '',
            pincode: row.pincode,
            delivery_status: row.delivery_status || 'Delivery',
            district: row.district || '',
            division: row.division || '',
            slag_basicrate: row.slag_basicrate || '0',
            transportation_by_truck: row.transportation_by_truck || '0',
            unloading_charges: row.unloading_charges || '0',
            km: row.km || '0',
            forty_ton_hydraulic: row.forty_ton_hydraulic || '0',
            thirty_ton_hydraulic: row.thirty_ton_hydraulic || '0',
            twenty_ton_hydraulic: row.twenty_ton_hydraulic || '0',
            final_price: row.final_price || '0',
            is_active: row.is_active === 'True' || row.is_active === 'true'
        });
    }

    console.log(`\n📊 Total rows to import: ${rows.length}`);

    // Step 2: Delete all existing pincodes
    console.log('\n🗑️  Clearing existing pincodes...');
    const { error: deleteError } = await supabase
        .from('pincodes')
        .delete()
        .neq('id', 0);

    if (deleteError) {
        console.error('❌ Error deleting existing data:', deleteError.message);
        return;
    }
    console.log('✅ Existing data cleared.');

    // Step 3: Insert in batches of 50
    const BATCH_SIZE = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
            .from('pincodes')
            .insert(batch);

        if (error) {
            console.error(`\n❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
            // If it's a column error, try without twenty_ton_hydraulic
            if (error.message.includes('twenty_ton_hydraulic')) {
                console.log('   Retrying without twenty_ton_hydraulic column...');
                const cleanBatch = batch.map(r => {
                    const { twenty_ton_hydraulic, ...rest } = r;
                    return rest;
                });
                const { error: retryError } = await supabase
                    .from('pincodes')
                    .insert(cleanBatch);
                if (!retryError) {
                    inserted += cleanBatch.length;
                    process.stdout.write(`\r✅ Inserted: ${inserted}/${rows.length}`);
                } else {
                    errors++;
                }
            } else {
                errors++;
            }
        } else {
            inserted += batch.length;
            process.stdout.write(`\r✅ Inserted: ${inserted}/${rows.length}`);
        }
    }

    console.log(`\n\n🎉 Import complete!`);
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ❌ Failed batches: ${errors}`);
    
    if (errors > 0 && inserted === 0) {
        console.log('\n⚠️  If all batches failed due to missing column, run this SQL in Supabase:');
        console.log("   ALTER TABLE public.pincodes ADD COLUMN twenty_ton_hydraulic text DEFAULT '0';");
        console.log('   Then re-run this script.');
    }
}

importPincodes().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
