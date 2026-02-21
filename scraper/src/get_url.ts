import { request } from 'undici';
import * as cheerio from 'cheerio';

async function test() {
    try {
        console.log("Fetching book page to find category link...");
        const resp = await request('https://www.dr.com.tr/Kitap/Kurk-Mantolu-Madonna/Sabahattin-Ali/Edebiyat/Roman/Turk-Klasik/urunno=0000000058245', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await resp.body.text();
        const $ = cheerio.load(html);
        const link = $('ul.breadcrumb li a').last().attr('href');
        console.log('--- FOUND URL ---');
        console.log('https://www.dr.com.tr' + link);
        console.log('------------------');
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}
test();
