import { crawlAndSyncCategory } from './src/processor';

async function test() {
    console.log('--- BKM Kitap Scraper Verification ---');
    // Test with Edebiyat category, only 1 page
    await crawlAndSyncCategory('https://www.bkmkitap.com/edebiyat-kitaplari', 'BKM Kitap', 1);
    console.log('--- Verification Finished ---');
}

test();
