import { crawlAndSyncCategory, fastUpdateCategory } from './processor';
import { SCRAPE_TARGETS } from './config';

async function main() {
    const isFastMode = process.argv.includes('--fast');

    console.log(`🚀 Starting Book Aggregator Scraper (${isFastMode ? 'FAST Mode' : 'FULL Mode'})`);
    console.log(`📋 Found ${SCRAPE_TARGETS.length} targets in configuration.`);

    for (const target of SCRAPE_TARGETS) {
        console.log(`\n📂 Target: ${target.name}`);
        try {
            if (isFastMode) {
                await fastUpdateCategory(target.url, target.maxPages);
            } else {
                await crawlAndSyncCategory(target.url, target.maxPages);
            }
        } catch (err: any) {
            console.error(`❌ Error crawling ${target.name}: ${err.message}`);
        }
    }

    console.log("\n🎯 All Scraping Tasks Completed!");
    process.exit(0);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
