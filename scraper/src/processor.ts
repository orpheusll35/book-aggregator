import pLimit from 'p-limit';
import { supabase } from './supabase';
import { scrapeDRPage, ScrapedBook, discoverBooksFromCategory } from './scraper-dr';
import { jitter } from './utils';

// Configuration
const CONCURRENCY_LIMIT = 10; // 10-15 is safe for single IP
const limit = pLimit(CONCURRENCY_LIMIT);

/**
 * Saves or updates a book and its price in Supabase.
 */
async function syncToDatabase(scrapedData: ScrapedBook) {
    try {
        // 1. Get Store ID (D&R)
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('name', 'D&R')
            .single();

        if (!store) throw new Error("D&R store not found in DB");

        // 2. Upsert Book
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

        // 3. Upsert Price
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
        console.error(`DB Sync Error for ISBN ${scrapedData.isbn}: ${error.message}`);
        return false;
    }
}

/**
 * Updates prices only for existing books (Fast Mode).
 */
async function syncPriceOnly(data: Partial<ScrapedBook>) {
    try {
        // Find the price record by URL to get the book_id
        const { data: priceRecord } = await supabase
            .from('book_prices')
            .select('book_id, id')
            .eq('url', data.url)
            .single();

        if (!priceRecord) return false; // Book not in DB, needs full crawl

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
export async function crawlAndSyncCategory(categoryUrl: string, maxPages: number = 1) {
    console.log(`--- Starting Crawl for Category: ${categoryUrl} ---`);

    // 1. Discover URLs
    const urls = await discoverBooksFromCategory(categoryUrl, maxPages);
    console.log(`Discovered ${urls.length} book URLs.`);

    // 2. Process in Parallel with Rate Limiting
    const tasks = urls.map((url, index) => {
        return limit(async () => {
            // Add a small jittered delay between starting tasks to avoid burst
            await jitter(100, 500);

            console.log(`[${index + 1}/${urls.length}] Processing: ${url}`);

            const data = await scrapeDRPage(url);
            if (data) {
                const success = await syncToDatabase(data);
                if (success) {
                    console.log(`[OK] Synced: ${data.title}`);
                }
            } else {
                console.warn(`[SKIP] Failed to scrape: ${url}`);
            }
        });
    });

    await Promise.all(tasks);
    console.log(`--- Finished Crawl for Category: ${categoryUrl} ---`);
}

/**
 * Fast-update all prices in a category by only scanning list pages.
 */
export async function fastUpdateCategory(categoryUrl: string, maxPages: number = 1) {
    console.log(`--- Starting FAST Price Update: ${categoryUrl} ---`);

    for (let page = 1; page <= maxPages; page++) {
        console.log(`Scanning list page ${page}...`);
        const { scrapeBooksFromList } = require('./scraper-dr');
        const books = await scrapeBooksFromList(categoryUrl, page);

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
    console.log(`--- Finished FAST Update: ${categoryUrl} ---`);
}

// Example Run
// crawlAndSyncCategory('https://www.dr.com.tr/Kitap/Edebiyat/Roman/Turk-Klasik/', 1);
