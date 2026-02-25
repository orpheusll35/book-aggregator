import { buildScraperApiUrl } from './src/utils';
import * as dotenv from 'dotenv';
import path from 'path';

// Force reload .env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

async function testRotation() {
    console.log('--- Testing API Key Rotation ---');
    console.log('SCRAPER_API_KEY in env:', process.env.SCRAPER_API_KEY);

    for (let i = 0; i < 10; i++) {
        const url = buildScraperApiUrl('https://example.com');
        const keyMatch = url.match(/api_key=([^&]+)/);
        const key = keyMatch ? keyMatch[1] : 'NOT FOUND';
        console.log(`Request ${i + 1}: Key used: ${key.substring(0, 8)}...`);
    }
}

testRotation();
