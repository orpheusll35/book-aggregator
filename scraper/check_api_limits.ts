import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the current directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEYS_RAW = process.env.SCRAPER_API_KEY;

async function checkLimits() {
    if (!API_KEYS_RAW) {
        console.error('❌ Error: SCRAPER_API_KEY not found in .env file.');
        return;
    }

    const keys = API_KEYS_RAW.split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`--- ScraperAPI Usage Limits (Found ${keys.length} keys) ---`);

    let totalLimit = 0;
    let totalUsed = 0;
    let totalConcurrency = 0;

    for (const [index, key] of keys.entries()) {
        try {
            const response = await axios.get(`https://api.scraperapi.com/account?api_key=${key}`);
            const data = response.data;

            const limit = data.request_limit ?? data.requestLimit ?? 0;
            const used = data.request_count ?? data.requestCount ?? 0;
            const concurrency = data.concurrency_limit ?? data.concurrencyLimit ?? 0;

            totalLimit += limit;
            totalUsed += used;
            totalConcurrency += concurrency;

            console.log(`\n🔑 Key #${index + 1} (${key.slice(0, 6)}...):`);
            console.log(`   Plan: ${data.plan_name ?? 'N/A'}`);
            console.log(`   Credits: ${used} / ${limit} (${((used / limit) * 100).toFixed(1)}% used)`);
            console.log(`   Concurrency: ${concurrency}`);
        } catch (error: any) {
            console.error(`❌ Failed to fetch limits for Key #${index + 1}: ${error.message}`);
        }
    }

    console.log('\n======================================');
    console.log('📊 AGGREGATE TOTALS:');
    console.log(`   Total Usage: ${totalUsed} / ${totalLimit} (${((totalUsed / totalLimit) * 100).toFixed(2)}%)`);
    console.log(`   Total Remaining: ${totalLimit - totalUsed}`);
    console.log(`   Total Combined Concurrency: ${totalConcurrency}`);
    console.log('======================================\n');
}

checkLimits();
