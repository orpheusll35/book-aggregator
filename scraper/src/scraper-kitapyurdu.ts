import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { getHeaders, jitter, buildScraperApiUrl, decodeHtmlEntities } from './utils';
import { ScrapedBook } from './scraper-kirmizikedi';

/**
 * Scrapes a single product page from Kitapyurdu.
 */
export async function scrapeKitapyurduPage(url: string, retries = 3): Promise<ScrapedBook | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            let response;
            try {
                // Try direct first
                response = await axios.get(url, {
                    headers: getHeaders(),
                    timeout: 20000
                });
            } catch (err: any) {
                console.warn(`[DIRECT BLOCKED] Kitapyurdu direct failed for ${url}, trying ScraperAPI (Standard)...`);
                // Disable render: true for speed, as JSON-LD is in raw HTML
                const scraperUrl = buildScraperApiUrl(url, false, true);
                response = await axios.get(scraperUrl, {
                    headers: getHeaders(),
                    timeout: 60000
                });
            }

            const html = response.data;
            const $ = cheerio.load(html);

            // Use JSON-LD if available for reliable data
            let title = '';
            let author = '';
            let publisher = '';
            let isbn = '';
            let imageUrl = '';
            let price = '';
            let originalPrice = '';
            let inStock = false;
            const categories: string[] = [];

            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const json = JSON.parse($(el).html() || '{}');
                    if (json['@type'] === 'Book') {
                        title = json.name || '';
                        isbn = json.isbn || '';
                        if (json.author) author = Array.isArray(json.author) ? json.author[0].name : json.author.name;
                        if (json.publisher) publisher = json.publisher.name;
                        if (json.image) imageUrl = json.image;
                    }
                } catch (e) { }
            });

            // Fallbacks for HTML selectors
            if (!title) title = $('.pr_header__heading').text().trim();
            if (!author) author = $('.pr_producers__manufacturer .pr_producers__link').first().text().trim();
            if (!publisher) publisher = $('.pr_producers__publisher .pr_producers__link').first().text().trim();
            if (!imageUrl) imageUrl = $('#js-book-cover').attr('src') || '';

            // Price logic
            // Kitapyurdu uses specific structure for prices
            const priceWhole = $('.pr_price .price__item').text().trim();
            // The price text usually looks like "350,56"
            price = priceWhole.replace(/TL/g, '').replace(/\s/g, '').trim();

            // Original price (Liste Fiyatı)
            $('.attributes table tr').each((i, el) => {
                const label = $(el).find('td').first().text();
                if (label.includes('Liste Fiyatı')) {
                    originalPrice = $(el).find('td').last().text().replace(/TL/g, '').replace(/\s/g, '').trim();
                }
            });

            // Stock
            inStock = html.includes('Sepete Ekle') && !html.includes('Stokta Yok');

            // Categories
            $('.rel-cats__link span').each((i, el) => {
                const cat = $(el).text().trim();
                if (cat && !categories.includes(cat)) categories.push(cat);
            });

            if (!isbn) {
                const isbnMatch = html.match(/978\d{10}/);
                if (isbnMatch) isbn = isbnMatch[0];
            }

            if (!isbn || !title) return null;

            return {
                title: decodeHtmlEntities(title),
                author: decodeHtmlEntities(author),
                publisher: decodeHtmlEntities(publisher),
                price,
                originalPrice,
                isbn,
                imageUrl,
                url,
                inStock,
                categories
            };
        } catch (error: any) {
            console.error(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt === retries) return null;
            await jitter(2000, 5000);
        }
    }
    return null;
}

/**
 * Discovers book URLs from a Kitapyurdu category page.
 */
export async function discoverBooksFromKitapyurduCategory(categoryUrl: string, maxPages: number = 1): Promise<string[]> {
    const bookUrls: string[] = [];
    const BATCH_SIZE = 500; // Increased to 500 for much faster processing
    const CONSECUTIVE_EMPTY_LIMIT = 2; // Stop if 2 batches of 500 (1000 pages) find nothing
    let consecutiveEmptyBatches = 0;

    for (let startPage = 1; startPage <= maxPages; startPage += BATCH_SIZE) {
        const endPage = Math.min(startPage + BATCH_SIZE - 1, maxPages);
        const currentBatchPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

        console.log(`[Discovery] Scanning Kitapyurdu pages ${startPage} - ${endPage}...`);

        let booksInThisBatch = 0;
        const batchTasks = currentBatchPages.map(page => async () => {
            try {
                let url = categoryUrl;
                if (page > 1) {
                    url = categoryUrl.includes('?') ? `${categoryUrl}&page=${page}` : `${categoryUrl}?page=${page}`;
                }

                // Small jitter to not overwhelm the proxy/site completely
                await jitter(200, 800);

                let response;
                try {
                    response = await axios.get(url, { headers: getHeaders(), timeout: 20000 });
                } catch (err: any) {
                    if (err.response?.status === 403) {
                        const scraperUrl = buildScraperApiUrl(url, false, true);
                        response = await axios.get(scraperUrl, { headers: getHeaders(), timeout: 60000 });
                    } else {
                        throw err;
                    }
                }

                const html = response.data;
                const $ = cheerio.load(html);
                let foundOnPage = 0;

                $('.ky-product, .product-cr').each((i, el) => {
                    const href = $(el).find('a.ky-product-cover, .name a').first().attr('href') || $(el).find('a').first().attr('href');
                    if (href) {
                        const fullUrl = href.startsWith('http') ? href : `https://www.kitapyurdu.com${href}`;
                        if (!bookUrls.includes(fullUrl)) {
                            bookUrls.push(fullUrl);
                            foundOnPage++;
                        }
                    }
                });

                booksInThisBatch += foundOnPage;

                // Log every 100 pages inside the batch to show progress
                if (page % 100 === 0) {
                    console.log(`[Discovery] Page ${page} reached. Total URLs found so far: ${bookUrls.length}`);
                }

                return foundOnPage;
            } catch (error: any) {
                // Don't log every error to keep console clean, just count them?
                return 0;
            }
        });

        // Concurrency increased to 20 for faster throughput
        const limit = pLimit(20);
        await Promise.all(batchTasks.map(t => limit(t)));

        console.log(`[Discovery] Batch ${startPage}-${endPage} finished. Found ${booksInThisBatch} new books. (Cumulative Total: ${bookUrls.length})`);

        if (booksInThisBatch === 0) {
            consecutiveEmptyBatches++;
            if (consecutiveEmptyBatches >= CONSECUTIVE_EMPTY_LIMIT) {
                console.log(`[Discovery] No new books found in ${CONSECUTIVE_EMPTY_LIMIT} consecutive batches (1000 pages). Stopping.`);
                break;
            }
        } else {
            consecutiveEmptyBatches = 0;
        }

        if (startPage > 40000 && booksInThisBatch < 10) {
            console.log("[Discovery] Reached high page count with very low results. Stopping for safety.");
            break;
        }
    }

    return [...new Set(bookUrls)];
}

/**
 * Fast scraper for Kitapyurdu listing pages.
 */
export async function scrapeKitapyurduFromList(categoryUrl: string, page: number = 1): Promise<Partial<ScrapedBook>[]> {
    const books: Partial<ScrapedBook>[] = [];
    try {
        let url = categoryUrl;
        if (page > 1) {
            url = categoryUrl.includes('?') ? `${categoryUrl}&page=${page}` : `${categoryUrl}?page=${page}`;
        }

        let response;
        try {
            response = await axios.get(url, { headers: getHeaders(), timeout: 20000 });
        } catch (err) {
            const scraperUrl = buildScraperApiUrl(url, true, true);
            response = await axios.get(scraperUrl, { headers: getHeaders(), timeout: 60000 });
        }

        const $ = cheerio.load(response.data);

        const kyProducts = $('.ky-product');
        const classicProducts = $('.product-cr');

        // Handling block for fast mode too
        if (kyProducts.length === 0 && classicProducts.length === 0) {
            if (response.data.includes('robot') || response.data.includes('pardon')) {
                console.warn(`[BLOCKED] List scrape blocked for ${url}, skipping...`);
                // For fast mode, we might just skip or try one scraper api call
                return [];
            }
        }

        // Modern cards
        kyProducts.each((i, el) => {
            const b = $(el);
            // Use refined selectors from ky_category_debug.html
            const title = b.find('.ky-product-title').first().text().trim();
            const author = b.find('.ky-product-author').first().text().trim();
            const url = b.find('a.ky-product-cover').attr('href') || b.find('a').first().attr('href');

            // Try to find the price in the special price label or grid variant
            let price = b.find('.ky-product-sell-price').text().trim() ||
                b.find('.ky-product-price-label .fw-bold').text().trim();

            price = price.replace(/TL/g, '').replace(/\s/g, '').replace(',', '.').trim();

            const inStock = b.find('[data-action="add-to-cart"]').length > 0;

            if (url && title) {
                books.push({
                    title: decodeHtmlEntities(title),
                    author: decodeHtmlEntities(author),
                    url,
                    price,
                    inStock
                });
            }
        });

        // Classic cards
        classicProducts.each((i, el) => {
            const b = $(el);
            const title = b.find('.name').text().trim();
            const author = b.find('.author').text().trim();
            const url = b.find('.name a').attr('href');
            const price = b.find('.price-new .value').text().trim().replace(',', '.');
            const inStock = b.find('.add-to-cart').length > 0;

            if (url && title) {
                books.push({
                    title: decodeHtmlEntities(title),
                    author: decodeHtmlEntities(author),
                    url,
                    price,
                    inStock
                });
            }
        });

    } catch (error: any) {
        console.error(`List scrape failed: ${error.message}`);
    }
    return books;
}
