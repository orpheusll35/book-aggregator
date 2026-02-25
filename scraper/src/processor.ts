import pLimit from 'p-limit';
import { supabase } from './supabase';
import { scrapeDRPage, ScrapedBook, discoverBooksFromCategory, scrapeBooksFromList } from './scraper-dr';
import { scrapeKirmiziKediPage, discoverBooksFromKirmiziKediCategory, scrapeKirmiziKediFromList } from './scraper-kirmizikedi';
import { scrapeBkmKitapPage, scrapeBkmKitapFromList } from './scraper-bkmkitap';
import { scrapeKitapyurduPage, discoverBooksFromKitapyurduCategory, scrapeKitapyurduFromList } from './scraper-kitapyurdu';
import { jitter } from './utils';

// Configuration
const CONCURRENCY_LIMIT = 50; // Increased for large store support
const limit = pLimit(CONCURRENCY_LIMIT);

/**
 * Saves or updates a book and its price in Supabase.
 */
export async function syncToDatabase(scrapedData: ScrapedBook, storeName: string) {
    try {
        // 1. Get Store ID
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('name', storeName)
            .single();

        if (!store) {
            console.error(`[ERROR] Store "${storeName}" not found in database. Please add it to "stores" table.`);
            return false;
        }

        // 2. Upsert Book (Always match by ISBN)
        const { data: book, error: bookError } = await supabase
            .from('books')
            .upsert({
                isbn: scrapedData.isbn,
                title: scrapedData.title,
                author: scrapedData.author,
                publisher: scrapedData.publisher,
                image_url: scrapedData.imageUrl,
                categories: scrapedData.categories
            }, { onConflict: 'isbn' })
            .select('id')
            .single();

        if (bookError) throw bookError;

        // 3. Upsert Price (Match by book_id and store_id)
        const { error: priceError } = await supabase
            .from('book_prices')
            .upsert({
                book_id: book.id,
                store_id: store.id,
                price: scrapedData.price,
                original_price: scrapedData.originalPrice,
                in_stock: scrapedData.inStock,
                url: scrapedData.url
            }, { onConflict: 'book_id, store_id' });

        if (priceError) throw priceError;

        return true;
    } catch (error: any) {
        console.error(`DB Sync Error for ISBN ${scrapedData.isbn} (${storeName}): ${error.message}`);
        return false;
    }
}

/**
 * Updates prices only for existing books (Fast Mode).
 */
async function syncPriceOnly(data: Partial<ScrapedBook>) {
    try {
        const { data: priceRecord } = await supabase
            .from('book_prices')
            .select('book_id, id')
            .eq('url', data.url)
            .single();

        if (!priceRecord) return false;

        const { error } = await supabase
            .from('book_prices')
            .update({
                price: data.price,
                original_price: data.originalPrice,
                in_stock: data.inStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', priceRecord.id);

        if (error) throw error;
        return true;
    } catch (error: any) {
        return false;
    }
}

/**
 * Main function to crawl a category and update books in parallel.
 */
export async function crawlAndSyncCategory(categoryUrl: string, storeName: string, maxPages: number = 1) {
    console.log(`--- Starting Crawl [${storeName}]: ${categoryUrl} ---`);

    // 1. Get Store ID Upfront
    const { data: storeRecord } = await supabase
        .from('stores')
        .select('id')
        .eq('name', storeName)
        .single();

    if (!storeRecord) {
        console.error(`[ERROR] Store "${storeName}" not found in database.`);
        return;
    }
    const storeId = storeRecord.id;

    // 2. Decide which discovery function to use
    let urls: string[] = [];
    if (storeName === 'D&R') {
        urls = await discoverBooksFromCategory(categoryUrl, maxPages);
    } else if (storeName === 'Kırmızı Kedi') {
        urls = await discoverBooksFromKirmiziKediCategory(categoryUrl, maxPages);
    } else if (storeName === 'BKM Kitap') {
        const discovered: string[] = [];
        for (let p = 1; p <= maxPages; p++) {
            const listBooks = await scrapeBkmKitapFromList(categoryUrl, p);
            if (listBooks.length === 0) break;
            listBooks.forEach(b => {
                if (b.url && !discovered.includes(b.url)) {
                    discovered.push(b.url);
                }
            });
            console.log(`Found ${discovered.length} total books so far (Page ${p}).`);
        }
        urls = discovered;
    } else if (storeName === 'Kitapyurdu') {
        urls = await discoverBooksFromKitapyurduCategory(categoryUrl, maxPages);
    }

    console.log(`Discovered ${urls.length} book URLs.`);

    // 3. Process in Batches
    const CHUNK_SIZE = 1000; // Slightly smaller chunks for faster DB checks
    const SKIP_THRESHOLD_HOURS = 48;

    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
        const chunk = urls.slice(i, i + CHUNK_SIZE);
        console.log(`[Processor] Checking chunk ${i / CHUNK_SIZE + 1} for fresh data...`);

        // --- SMART SKIP LOGIC ---
        // Find URLs in this chunk that were updated within the last 48 hours
        const thresholdDate = new Date(Date.now() - SKIP_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();

        const { data: freshPrices } = await supabase
            .from('book_prices')
            .select('url')
            .eq('store_id', storeId)
            .in('url', chunk)
            .gt('updated_at', thresholdDate);

        const freshUrls = new Set((freshPrices || []).map(p => p.url));
        const filteredChunk = chunk.filter(url => !freshUrls.has(url));

        if (freshUrls.size > 0) {
            console.log(`[Processor] Skipping ${freshUrls.size} books (Updated < ${SKIP_THRESHOLD_HOURS}h ago). Remaining in chunk: ${filteredChunk.length}`);
        }

        const tasks = filteredChunk.map((url, index) => {
            const globalIndex = i + index + 1;
            return limit(async () => {
                await jitter(200, 800);
                if (globalIndex % 50 === 0) {
                    console.log(`[${globalIndex}/${urls.length}] Scraping ${storeName}: ${url}`);
                }

                let data = null;
                if (storeName === 'D&R') {
                    data = await scrapeDRPage(url);
                } else if (storeName === 'Kırmızı Kedi') {
                    data = await scrapeKirmiziKediPage(url);
                } else if (storeName === 'BKM Kitap') {
                    data = await scrapeBkmKitapPage(url);
                } else if (storeName === 'Kitapyurdu') {
                    data = await scrapeKitapyurduPage(url);
                }

                if (data) {
                    await syncToDatabase(data, storeName);
                } else {
                    console.warn(`[SKIP] Failed to scrape: ${url}`);
                }
            });
        });

        await Promise.all(tasks);
    }
    console.log(`--- Finished Crawl [${storeName}]: ${categoryUrl} ---`);
}

/**
 * Fast-update all prices in a category by only scanning list pages.
 */
export async function fastUpdateCategory(categoryUrl: string, storeName: string, maxPages: number = 1) {
    console.log(`--- Starting FAST Price Update [${storeName}]: ${categoryUrl} ---`);

    for (let page = 1; page <= maxPages; page++) {
        console.log(`Scanning ${storeName} list page ${page}...`);

        let books: Partial<ScrapedBook>[] = [];
        if (storeName === 'D&R') {
            books = await scrapeBooksFromList(categoryUrl, page);
        } else if (storeName === 'Kırmızı Kedi') {
            books = await scrapeKirmiziKediFromList(categoryUrl, page);
        } else if (storeName === 'BKM Kitap') {
            books = await scrapeBkmKitapFromList(categoryUrl, page);
        } else if (storeName === 'Kitapyurdu') {
            books = await scrapeKitapyurduFromList(categoryUrl, page);
        }

        if (books.length === 0) break;

        const tasks = books.map((book: any) => {
            return limit(async () => {
                const success = await syncPriceOnly(book);
                if (success) {
                    console.log(`[FAST OK] Updated: ${book.title}`);
                }
            });
        });

        await Promise.all(tasks);
        await jitter(500, 1000);
    }
    console.log(`--- Finished FAST Update [${storeName}]: ${categoryUrl} ---`);
}

// Example Run
// crawlAndSyncCategory('https://www.dr.com.tr/Kitap/Edebiyat/Roman/Turk-Klasik/', 1);
