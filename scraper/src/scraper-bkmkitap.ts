import axios from 'axios';
import * as cheerio from 'cheerio';
import { getHeaders, jitter, buildScraperApiUrl } from './utils';
import { ScrapedBook } from './scraper-kirmizikedi';

/**
 * Scrapes a single product page from BKM Kitap.
 * Uses hidden input fields and JSON-LD for data extraction.
 */
export async function scrapeBkmKitapPage(url: string, retries = 3): Promise<ScrapedBook | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            let response;
            try {
                // Try direct first
                response = await axios.get(url, {
                    headers: getHeaders(),
                    timeout: 30000
                });
            } catch (err: any) {
                console.warn(`[DIRECT BLOCKED] BKM Kitap direct failed for ${url}, trying ScraperAPI...`);
                const scraperUrl = buildScraperApiUrl(url, true, true);
                response = await axios.get(scraperUrl, {
                    headers: getHeaders(),
                    timeout: 90000
                });
            }

            const html = response.data;
            const $ = cheerio.load(html);

            // BKM Kitap (T-Soft) uses hidden inputs for product data
            const title = $('#product-name').val()?.toString().trim() || $('h1').text().trim();
            const isbn = $('#product-barcode-code').val()?.toString().trim() || '';
            const priceText = $('#product-price').val()?.toString().trim() || '';
            const stockStatus = $('#product-stock-status').val()?.toString(); // "1" is usually in stock

            // Extract more details from PRODUCT_DATA script or JSON-LD
            let author = '';
            let publisher = '';
            let originalPrice = '';
            let imageUrl = $('meta[property="og:image"]').attr('content') || '';
            const categories: string[] = [];

            // Attempt to parse PRODUCT_DATA script for author/publisher
            $('script').each((i, el) => {
                const scriptContent = $(el).html() || '';
                if (scriptContent.includes('PRODUCT_DATA.push')) {
                    try {
                        const jsonStrMatch = scriptContent.match(/JSON\.parse\('(.*?)'\)/);
                        if (jsonStrMatch) {
                            let jsonStr = jsonStrMatch[1];
                            // T-Soft JSON in script tags is JS-string escaped.
                            // We need to unescape it. A reliable way is to use a temporary function or a safer replacement.
                            // But for simple cases, we can handle the common ones.
                            jsonStr = jsonStr
                                .replace(/\\"/g, '"')
                                .replace(/\\'/g, "'")
                                .replace(/\\\\/g, '\\')
                                .replace(/\\u([\da-f]{4})/gi, (match, grp) => {
                                    return String.fromCharCode(parseInt(grp, 16));
                                });

                            const decodedJson = JSON.parse(jsonStr);
                            author = decodedJson.model || '';
                            publisher = decodedJson.brand || '';
                            originalPrice = decodedJson.total_base_price?.toString() || '';
                            if (!imageUrl) imageUrl = decodedJson.image || '';
                        }
                    } catch (e) {
                        // Ignore parse errors, try fallback
                    }
                }
            });

            // Fallback for Author/Publisher from common selectors if script fail
            if (!author) author = $('.product-model').text().trim();
            if (!publisher) publisher = $('.product-brand').text().trim();

            // Extract Categories from Breadcrumb
            $('.breadcrumb li').each((i, el) => {
                const text = $(el).text().trim();
                if (text && !['Anasayfa', 'Ana Sayfa', 'Kitap'].includes(text)) {
                    categories.push(text);
                }
            });

            const inStock = stockStatus === '1' || html.includes('Sepete Ekle');

            if (!isbn) {
                // Try finding ISBN in the body if hidden input is missing
                const isbnMatch = html.match(/978\d{10}/);
                if (isbnMatch) {
                    return {
                        title,
                        author,
                        publisher,
                        price: priceText,
                        originalPrice,
                        isbn: isbnMatch[0],
                        inStock,
                        imageUrl,
                        categories,
                        url
                    };
                }
                console.warn(`[DEBUG] No ISBN found for BKM Kitap page: ${url}`);
                if (attempt < retries) continue;
                return null;
            }

            return {
                title,
                author,
                publisher,
                price: priceText,
                originalPrice,
                isbn,
                inStock,
                imageUrl,
                categories,
                url
            };
        } catch (error: any) {
            console.error(`[ERROR] BKM Kitap Scrape Attempt ${attempt} failed: ${error.message}`);
            if (attempt < retries) await jitter(2000, 5000);
            else return null;
        }
    }
    return null;
}

/**
 * Scrapes book cards from a category list.
 * BKM Kitap category pages have a JSON-like array in PRODUCT_DATA.
 */
export async function scrapeBkmKitapFromList(categoryUrl: string, page: number): Promise<Partial<ScrapedBook>[]> {
    try {
        const url = `${categoryUrl}${categoryUrl.includes('?') ? '&' : '?'}pg=${page}`;
        console.log(`Scraping BKM Kitap list: ${url}`);

        let response;
        try {
            response = await axios.get(url, { headers: getHeaders(), timeout: 30000 });
        } catch (err) {
            response = await axios.get(buildScraperApiUrl(url, true), { headers: getHeaders(), timeout: 90000 });
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const books: Partial<ScrapedBook>[] = [];

        // In T-Soft, each category page has script blocks with PRODUCT_DATA.push
        $('script').each((i, el) => {
            const content = $(el).html() || '';
            if (content.includes('PRODUCT_DATA.push')) {
                try {
                    // T-Soft often has PRODUCT_DATA.push(JSON.parse('...'))
                    // We need to extract what's inside JSON.parse('...') and unescape it
                    const matches = content.matchAll(/JSON\.parse\('(.*?)'\)/g);
                    for (const match of matches) {
                        try {
                            let jsonStr = match[1];
                            // T-Soft JSON in script tags is JS-string escaped.
                            jsonStr = jsonStr
                                .replace(/\\"/g, '"')
                                .replace(/\\'/g, "'")
                                .replace(/\\\\/g, '\\')
                                .replace(/\\u([\da-f]{4})/gi, (match, grp) => {
                                    return String.fromCharCode(parseInt(grp, 16));
                                });

                            const item = JSON.parse(jsonStr);

                            if (item && item.url) {
                                books.push({
                                    title: item.name,
                                    url: item.url.startsWith('http') ? item.url : `https://www.bkmkitap.com/${item.url.startsWith('/') ? item.url.slice(1) : item.url}`,
                                    price: item.total_sale_price?.toString(),
                                    originalPrice: item.total_base_price?.toString(),
                                    inStock: item.quantity > 0 || item.available === true,
                                    imageUrl: item.image,
                                    author: item.model,
                                    publisher: item.brand,
                                    isbn: item.code || item.barcode || '' // T-Soft often uses item.code for ISBN
                                });
                            }
                        } catch (innerError) {
                            // console.warn('Failed to parse inner JSON block', innerError);
                        }
                    }
                } catch (e) {
                    // Skip invalid blocks
                }
            }
        });

        // Fallback: Cheerio scraping if PRODUCT_DATA is missing or incomplete
        if (books.length === 0) {
            $('.product-item').each((i, el) => {
                const card = $(el);
                const titleLink = card.find('a.product-title, .productName a');
                const title = titleLink.text().trim();
                const href = titleLink.attr('href');
                const bookUrl = href ? (href.startsWith('http') ? href : `https://www.bkmkitap.com${href.startsWith('/') ? '' : '/'}${href}`) : '';

                const price = card.find('.product-price, .currentPrice').text().trim();
                const inStock = !card.text().toLowerCase().includes('tükendi') && !card.text().toLowerCase().includes('stokta yok');

                if (bookUrl && title) {
                    books.push({ title, url: bookUrl, price, inStock });
                }
            });
        }

        return books;
    } catch (error) {
        console.error(`[ERROR] BKM Kitap list scrape failed:`, error);
        return [];
    }
}
