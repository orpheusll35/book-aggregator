const axios = require('axios');
require('dotenv').config();

const keys = process.env.SCRAPER_API_KEY.split(',').map(k => k.trim());

async function check() {
    console.log('Total keys to check:', keys.length);
    for (const key of keys) {
        try {
            const res = await axios.get(`https://api.scraperapi.com/account?api_key=${key}`);
            console.log(`Key: ${key.substring(0, 6)}... Usage: ${res.data.requestCount} / ${res.data.requestLimit}`);
        } catch (e) {
            console.log(`Key: ${key.substring(0, 6)}... FAILED: ${e.message}`);
        }
    }
}

check();
