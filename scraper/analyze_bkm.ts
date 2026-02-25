import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const API_KEY = process.env.SCRAPER_API_KEY;

function buildScraperApiUrl(url: string) {
    return `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(url)}`;
}

async function analyze() {
    try {
        const targetCategoryUrl = 'https://www.bkmkitap.com/cok-satan-kitaplar';
        console.log(`Fetching category page (${targetCategoryUrl}) via ScraperAPI...`);
        const catRes = await axios.get(buildScraperApiUrl(targetCategoryUrl), { timeout: 60000 });
        fs.writeFileSync('bkm_category.html', catRes.data);
        console.log('Saved bkm_category.html');

        console.log('Fetching book page via ScraperAPI...');
        const bookRes = await axios.get(buildScraperApiUrl('https://www.bkmkitap.com/fareler-ve-insanlar'), { timeout: 60000 });
        fs.writeFileSync('bkm_book.html', bookRes.data);
        console.log('Saved bkm_book.html');
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

analyze();
