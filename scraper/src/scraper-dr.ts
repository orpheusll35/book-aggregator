import axios from 'axios';
import * as cheerio from 'cheerio';
import { getHeaders, jitter, buildScraperApiUrl, decodeHtmlEntities } from './utils';

export interface ScrapedBook {
    title: string;
    author: string;
    publisher: string;
    price: string;
    originalPrice?: string;
    isbn: string;
    inStock: boolean;
    imageUrl: string;
    categories: string[];
    url: string;
}

/**
 * Scrapes a single product page from D&R.
 */
export async function scrapeDRPage(url: string, retries = 3): Promise<ScrapedBook | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Direct request works better for D&R from residential IPs
            // Only use ScraperAPI as a fallback if the direct request is blocked
            let response;
            try {
                response = await axios.get(url, {
                    headers: getHeaders(),
                    timeout: 30000
                });
            } catch (err: any) {
                console.warn(`[DIRECT BLOCKED] Direct request failed for ${url}, trying ScraperAPI fallback...`);
                const scraperUrl = buildScraperApiUrl(url, true, true);
                response = await axios.get(scraperUrl, {
                    headers: getHeaders(),
                    timeout: 90000
                });
            }

            const html = response.data;

            const $ = cheerio.load(html);

            let title = ($('h1').text().trim() || $('.product-name').text().trim()).replace(/^Cover of\s+/i, '');

            const campaignPriceText = $('.campaign-price').text().trim();
            const salePriceText = $('.salePrice').text().trim() || $('.product-price').text().trim() || $('.discount-price').text().trim();
            let originalPriceText = $('.oldPrice').text().trim() || $('.old-price').text().trim() || $('.original-price').text().trim();

            let priceText = campaignPriceText || salePriceText;
            if (campaignPriceText && salePriceText && !originalPriceText) {
                originalPriceText = salePriceText;
            }

            const author = $('.author a').first().text().trim() ||
                $('.product-author a').text().trim() ||
                $('.authors-wrapper a').first().text().trim() ||
                $('.js-wrapper-author a').first().text().trim() ||
                $('.authors-wrapper').text().replace('Yazar:', '').trim() ||
                $('h2.author').text().replace('Yazar:', '').trim();

            let publisher = '';
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.toLowerCase().includes('yayinevi')) {
                    const text = $(el).text().trim();
                    if (text && !publisher) publisher = text;
                }
            });

            let mainImg = $('.product-image img, #main-product-img, .js-main-product-img, .js-prd-img, [id*="product-image"] img').first();

            // If still not found, search for any img with alt containing title
            if (!mainImg.length) {
                $('img').each((i, el) => {
                    const alt = $(el).attr('alt') || '';
                    if (alt.toLowerCase().includes(title.toLowerCase())) {
                        mainImg = $(el);
                        return false; // break loop
                    }
                });
            }

            let imageUrl = mainImg.attr('data-src') ||
                mainImg.attr('data-original') ||
                $('meta[property="og:image"]').attr('content') ||
                mainImg.attr('src') ||
                '';

            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            }

            const categories: string[] = [];
            $('ul.breadcrumb li').each((i, el) => {
                const text = $(el).text().trim();
                if (text && !['Ana sayfa', 'Kitap'].includes(text)) {
                    categories.push(text);
                }
            });

            let isbn = '';
            const bodyText = $('body').text().replace(/\s+/g, ' ');
            const isbnMatch = bodyText.match(/978\d{10}/);
            if (isbnMatch) {
                isbn = isbnMatch[0];
            }

            const inStock = $('.js-add-basket').length > 0 &&
                !html.toLowerCase().includes('tükendi') &&
                !html.toLowerCase().includes('temin edilememektedir') &&
                !html.toLowerCase().includes('stokta yok');

            if (!isbn) {
                // Not finding an ISBN might mean we hit a captcha or incomplete page, forcing a retry
                if (attempt < retries) {
                    console.warn(`[RETRY ${attempt}/${retries}] No ISBN found for ${url}. May be a captcha. Retrying...`);
                    await new Promise(res => setTimeout(res, attempt * 2000)); // progressive delay 
                    continue;
                }
                console.warn(`[DEBUG-SCRAPER] Giving up. No ISBN found on page: ${url}. HTML Title parsed: ${title}`);
                return null;
            }

            const cleanPrice = (text: string) => {
                if (!text) return '';
                // D&R prices can be messy: "279,50 TL \n %5 \n 264,50 TL"
                // We want to extract the last monetary value
                const parts = text.split('\n').map(p => p.trim()).filter(p => p.includes('TL'));
                return parts.length > 0 ? parts[parts.length - 1] : text.trim();
            };

            return {
                title: decodeHtmlEntities(title),
                author: decodeHtmlEntities(author),
                publisher: decodeHtmlEntities(publisher),
                price: cleanPrice(priceText),
                originalPrice: cleanPrice(originalPriceText),
                isbn,
                inStock,
                imageUrl,
                categories,
                url
            };
        } catch (error: any) {
            if (attempt < retries) {
                console.warn(`[RETRY ${attempt}/${retries}] Network error scraping ${url}: ${error.message}. Retrying...`);
                await new Promise(res => setTimeout(res, attempt * 2000)); // progressive delay
                continue;
            }
            console.error(`[ERROR] Failed to scrape D&R URL ${url} after ${retries} attempts: ${error.message}`);
            return null;
        }
    }
    return null;
}

/**
 * Discovers book URLs from a category page.
 */
export async function discoverBooksFromCategory(categoryUrl: string, maxPages: number = 1, retries = 3): Promise<string[]> {
    const bookUrls: string[] = [];

    for (let page = 1; page <= maxPages; page++) {
        let pageSuccess = false;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await jitter(1000, 2500); // Wait before hitting category page to avoid 403

                const separator = categoryUrl.includes('?') ? '&' : '?';
                const url = `${categoryUrl}${separator}Page=${page}`;
                console.log(`Discovering books from: ${url} (Attempt ${attempt}/${retries})`);

                let response;
                try {
                    response = await axios.get(url, {
                        headers: getHeaders(),
                        timeout: 30000
                    });
                } catch (err) {
                    const scraperUrl = buildScraperApiUrl(url, true, true);
                    response = await axios.get(scraperUrl, {
                        headers: getHeaders(),
                        timeout: 90000
                    });
                }

                const html = response.data;
                const $ = cheerio.load(html);

                const selectors = ['.prd-main-link', '.js-prd-item a', 'h3 a', 'a[href*="/kitap/"]'];

                let booksOnThisPage = 0;
                selectors.forEach(selector => {
                    $(selector).each((i, el) => {
                        const href = $(el).attr('href');
                        if (href && href.toLowerCase().includes('/kitap/')) {
                            const fullUrl = href.startsWith('http') ? href : `https://www.dr.com.tr${href}`;
                            if (!bookUrls.includes(fullUrl)) {
                                bookUrls.push(fullUrl);
                                booksOnThisPage++;
                            }
                        }
                    });
                });

                console.log(`Found ${booksOnThisPage} new books on page ${page}. (Total: ${bookUrls.length})`);

                pageSuccess = true;

                // If no products found on this page, stop exploring this category deeply
                if (booksOnThisPage === 0) {
                    page = maxPages; // Force outer loop to terminate
                }

                break; // Break the retry loop
            } catch (error: any) {
                if (attempt < retries) {
                    console.warn(`[RETRY ${attempt}/${retries}] Error discovering from category ${categoryUrl} page ${page}: ${error.message}. Retrying...`);
                    await new Promise(res => setTimeout(res, attempt * 5000)); // 5s, 10s wait
                } else {
                    console.error(`[ERROR] Failed to discover from category ${categoryUrl} page ${page} after ${retries} attempts: ${error.message}`);
                    return [...new Set(bookUrls)]; // Return what we have gathered so far
                }
            }
        }
    }

    return [...new Set(bookUrls)];
}

/**
 * Scrapes all book cards from a category page (Fast Mode).
 */
export async function scrapeBooksFromList(categoryUrl: string, page: number, retries = 3): Promise<Partial<ScrapedBook>[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await jitter(1000, 2500); // Wait before hitting list page to avoid 403

            const separator = categoryUrl.includes('?') ? '&' : '?';
            const url = `${categoryUrl}${separator}Page=${page}`;

            let response;
            try {
                response = await axios.get(url, {
                    headers: getHeaders(),
                    timeout: 30000
                });
            } catch (err) {
                const scraperUrl = buildScraperApiUrl(url, true, true);
                response = await axios.get(scraperUrl, {
                    headers: getHeaders(),
                    timeout: 90000
                });
            }

            const html = response.data;

            console.log(`[DEBUG] Fetched ${url}. HTML Length: ${html.length}. Status: ${response.status}`);
            const $ = cheerio.load(html);
            console.log(`[DEBUG] Page Title: ${$('title').text()}`);
            const books: Partial<ScrapedBook>[] = [];

            $('.js-prd-item, .product-item').each((i, el) => {
                const card = $(el);

                // Try multiple title/link selectors
                const titleElement = card.find('.prd-main-link, .product-name, h3 a, a[href*="/kitap/"]').first();
                const title = titleElement.attr('title') || titleElement.text().trim();
                const href = titleElement.attr('href');
                const url = href ? (href.startsWith('http') ? href : `https://www.dr.com.tr${href}`) : '';

                // Try multiple price selectors
                const rawPrice = card.find('.prd-price-current, .campaign-price, .salePrice, .product-price').first().text().trim();
                const cleanPrice = (text: string) => {
                    if (!text) return '';
                    const parts = text.split('\n').map(p => p.trim()).filter(p => p.includes('TL'));
                    return parts.length > 0 ? parts[parts.length - 1] : text.trim();
                };
                const price = cleanPrice(rawPrice);
                const originalPrice = cleanPrice(card.find('.prd-price-old, .oldPrice').first().text().trim());

                const inStock = !card.text().toLowerCase().includes('tükendi') &&
                    !card.text().toLowerCase().includes('temin edilememektedir') &&
                    !card.text().toLowerCase().includes('stokta yok');

                if (url && price) {
                    books.push({
                        title,
                        url,
                        price,
                        originalPrice,
                        inStock
                    });
                }
            });

            console.log(`[DEBUG] Found ${books.length} books on ${url}`);

            return books;
        } catch (error: any) {
            if (attempt < retries) {
                console.warn(`[RETRY ${attempt}/${retries}] Error in fast scrape for ${categoryUrl} page ${page}: ${error.message}. Retrying...`);
                await new Promise(res => setTimeout(res, attempt * 5000));
            } else {
                console.error(`[ERROR] Failed fast scrape for ${categoryUrl} page ${page} after ${retries} attempts: ${error.message}`);
                return [];
            }
        }
    }
    return [];
}
