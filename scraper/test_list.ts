import { scrapeBkmKitapFromList } from './src/scraper-bkmkitap';

async function test() {
    console.log('--- BKM Kitap List Test ---');
    const books = await scrapeBkmKitapFromList('https://www.bkmkitap.com/edebiyat-kitaplari', 1);
    console.log(`Discovered ${books.length} books.`);
    if (books.length > 0) {
        console.log('First 3 books:', books.slice(0, 3));
    }
}

test();
