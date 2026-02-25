const axios = require('axios');
const { buildScraperApiUrl } = require('./dist/utils'); // Use compiled utils
require('dotenv').config();

async function forceProxyTest() {
    console.log('--- FORCED PROXY TEST (4 Requests) ---');
    for (let i = 0; i < 4; i++) {
        const target = 'https://httpbin.org/ip'; // Simple IP check
        const proxyUrl = buildScraperApiUrl(target);

        // Extract key from proxyUrl to see what we are sending
        const urlObj = new URL(proxyUrl);
        const apiKey = urlObj.searchParams.get('api_key');

        console.log(`Request ${i + 1}: Calling with key ${apiKey.substring(0, 8)}...`);

        try {
            const res = await axios.get(proxyUrl);
            console.log(`   Success! Response IP: ${res.data.origin}`);
        } catch (e) {
            console.log(`   Failed: ${e.message}`);
        }
    }
}

forceProxyTest();
