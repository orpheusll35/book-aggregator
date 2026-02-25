import { crawlAndSyncCategory } from './src/processor';

async function test() {
    console.log('--- BKM Kitap New Category Verification ---');
    // Test with Çok Satanlar category, only 1 page
    await crawlAndSyncCategory('https://www.bkmkitap.com/cok-satan-kitaplar', 'BKM Kitap', 1);
    console.log('--- Verification Finished ---');
}

test();
