import { supabase } from './src/supabase';
import { scrapeKirmiziKediPage } from './src/scraper-kirmizikedi';
import { syncToDatabase } from './src/processor';
import { jitter } from './src/utils';
import pLimit from 'p-limit';

const limit = pLimit(5); // Adjust concurrency

async function rescrapeMissingAuthors() {
    console.log("--- STARTING RETROACTIVE SCRAPE FOR MISSING AUTHORS ---");

    // 1. Get Store ID
    const { data: storeData } = await supabase.from('stores').select('id').eq('name', 'Kırmızı Kedi').single();
    if (!storeData) return console.log("Kırmızı Kedi not found");

    // 2. Fetch books missing an author
    const { data: books, error } = await supabase
        .from('book_prices')
        .select(`url, books!inner(author, title)`)
        .eq('store_id', storeData.id);

    if (error) {
        console.error("Error fetching books:", error);
        return;
    }

    // 3. Filter empty strings or nulls
    const missingBooks: string[] = [];
    books.forEach((b: any) => {
        const author = b.books?.author;
        if (!author || author.trim() === '') {
            missingBooks.push(b.url);
        }
    });

    console.log(`Found ${missingBooks.length} books strictly missing authors. Starting rescrape...`);

    // 4. Process
    let successCount = 0;
    let failCount = 0;

    const tasks = missingBooks.map((url, index) => {
        return limit(async () => {
            await jitter(500, 1500);
            try {
                console.log(`[${index + 1}/${missingBooks.length}] Scraping: ${url}`);
                const scrapedData = await scrapeKirmiziKediPage(url);

                if (scrapedData && scrapedData.author && scrapedData.author.trim() !== '') {
                    const saved = await syncToDatabase(scrapedData, "Kırmızı Kedi");
                    if (saved) {
                        console.log(`[OK] Updated author for: ${scrapedData.title} -> ${scrapedData.author}`);
                        successCount++;
                    } else {
                        console.error(`[DB ERROR] Failed to sync: ${scrapedData.title}`);
                        failCount++;
                    }
                } else {
                    console.warn(`[SKIP] Scraper still found no author for: ${url}`);
                    failCount++;
                }
            } catch (err: any) {
                console.error(`[FATAL] Error scraping ${url}: ${err.message}`);
                failCount++;
            }
        });
    });

    await Promise.all(tasks);

    console.log(`--- RETROACTIVE SCRAPE COMPLETE ---`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed or still missing: ${failCount}`);
}

rescrapeMissingAuthors();
