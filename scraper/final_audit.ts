import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const keys = (process.env.SCRAPER_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);

async function run() {
    console.log('--- FINAL API REPORT ---');
    for (let i = 0; i < keys.length; i++) {
        try {
            const res = await axios.get(`https://api.scraperapi.com/account?api_key=${keys[i]}`);
            const { requestLimit, requestCount, planName } = res.data;
            console.log(`Key ${i + 1} (${keys[i].substring(0, 6)}...): ${requestCount} / ${requestLimit} [${planName}]`);
        } catch (e: any) {
            console.log(`Key ${i + 1} failed: ${e.message}`);
        }
    }
}
run();
