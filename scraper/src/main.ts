import { crawlAndSyncCategory, fastUpdateCategory } from './processor';
import { SCRAPE_TARGETS } from './config';

async function main() {
    const isFastMode = process.argv.includes('--fast');

    // Parse --store <name> argument
    const storeIndex = process.argv.indexOf('--store');
    const targetStore = storeIndex !== -1 ? process.argv[storeIndex + 1] : null;

    console.log(`🚀 Starting Book Aggregator Scraper (${isFastMode ? 'FAST Mode' : 'FULL Mode'})`);

    const normalize = (str: string) => {
        return str.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    };

    let targets = SCRAPE_TARGETS;
    if (targetStore) {
        const normalizedTarget = normalize(targetStore);
        targets = SCRAPE_TARGETS.filter(t => {
            const normalizedStore = normalize(t.store);
            return normalizedStore.includes(normalizedTarget) || normalizedTarget.includes(normalizedStore);
        });
        console.log(`🔍 Filtering for store: ${targetStore}`);
    }

    console.log(`📋 Found ${targets.length} targets to process.`);

    for (const target of targets) {
        console.log(`\n📂 Target: ${target.name} [${target.store}]`);
        try {
            if (isFastMode) {
                await fastUpdateCategory(target.url, target.store, target.maxPages);
            } else {
                await crawlAndSyncCategory(target.url, target.store, target.maxPages);
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
