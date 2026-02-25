import axios from 'axios';
import * as cheerio from 'cheerio';
import { getHeaders, buildScraperApiUrl } from './src/utils';

async function testEncoding() {
    const url = 'https://www.kitapyurdu.com/kitap/ince-memed-1/1070.html';
    const scraperUrl = buildScraperApiUrl(url, false, true);

    console.log('Fetching with ScraperAPI...');
    const response = await axios.get(scraperUrl, { headers: getHeaders() });
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('.pr_header__heading').text().trim();
    console.log('Extracted Title (RAW):', title);

    // Check JSON-LD
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const json = JSON.parse($(el).html() || '{}');
            if (json['@type'] === 'Book') {
                console.log('JSON-LD Name:', json.name);
            }
        } catch (e) { }
    });
}

testEncoding();
