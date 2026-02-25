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
 * Scrapes a single product page from Kırmızı Kedi.
 */
export async function scrapeKirmiziKediPage(url: string, retries = 3): Promise<ScrapedBook | null> {
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
                console.warn(`[DIRECT BLOCKED] Kırmızı Kedi direct failed for ${url}, trying ScraperAPI...`);
                const scraperUrl = buildScraperApiUrl(url, true, true);
                response = await axios.get(scraperUrl, {
                    headers: getHeaders(),
                    timeout: 90000
                });
            }

            const html = response.data;
            const $ = cheerio.load(html);

            const title = $('.product-name').text().trim() || $('h1').text().trim();
            const rawPriceText = $('.product-price').text().trim();
            const priceText = rawPriceText.split('\n').pop()?.trim() || rawPriceText;
            const originalPriceText = $('.product-price-old').text().trim();

            let author = '';
            let isbn = '';
            let publisher = 'Kırmızı Kedi';

            // Fallback for author extraction across the whole page body
            $('*').each((i, el) => {
                const text = $(el).text().trim();
                // We must be careful not to grab massive wrapper elements.
                if ($(el).children().length === 0 || $(el).prop('tagName') === 'B' || $(el).prop('tagName') === 'STRONG') {
                    if (text.startsWith('Yazar:')) {
                        const name = text.replace('Yazar:', '').trim();
                        if (name) {
                            author = name;
                        } else {
                            // The author might be a sibling
                            const nextSibling = $(el).next();
                            if (nextSibling.length > 0) {
                                author = nextSibling.text().trim();
                            } else {
                                // sometimes the parent has it: <div> <b>Yazar:</b> <span>Name</span> </div>
                                const parent = $(el).parent();
                                const siblingName = parent.find('span, a').not(el).first().text().trim();
                                if (siblingName && !siblingName.includes('Yazar:')) {
                                    author = siblingName;
                                }
                            }
                        }
                    }
                }
            });

            // Extract from technical specs/metadata list (Publisher, ISBN, Author fallback)
            $('.product-feature-content .list-item, .product-feature-content div, .m-2, .collapse').each((i, el) => {
                const text = $(el).text().trim();
                if (text.includes('Yazar:')) {
                    const extractedAuthor = text.replace('Yazar:', '').trim();
                    if (!author && extractedAuthor) author = extractedAuthor;
                } else if (text.includes('Barkod:') || text.includes('ISBN:')) {
                    isbn = text.replace(/[^0-9]/g, '').trim();
                } else if (text.includes('Yayınevi:')) {
                    publisher = text.replace('Yayınevi:', '').trim();
                }
            });

            // If author is still not found, try itemprop (standard metadata)
            if (!author || author === '') {
                author = $('[itemprop="author"]').first().text().trim();
            }

            // Final cleanup for author (remove newlines if any)
            if (author) author = author.split('\n')[0].trim();

            // Fallback ISBN regex if table parsing fails
            if (!isbn || isbn.length < 10) {
                const bodyText = $('body').text();
                const isbnMatch = bodyText.match(/978\d{10}/);
                if (isbnMatch) isbn = isbnMatch[0];
            }

            let imageUrl = $('.product-image img').attr('src') ||
                $('.product-image img').attr('data-src') ||
                $('meta[property="og:image"]').attr('content') || '';

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = 'https://www.kirmizikedi.com' + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
            }

            const inStock = $('.add-to-basket.in-stock').length > 0 ||
                ($('.add-to-basket').length > 0 && !$('.add-to-basket').hasClass('no-stock')) ||
                (!html.toLowerCase().includes('tükendi') && !html.toLowerCase().includes('stokta yok'));

            const categories: string[] = [];
            $('.breadcrumb li').each((i, el) => {
                const text = $(el).text().trim();
                if (text && !['Ana Sayfa', 'Kitap'].includes(text)) {
                    categories.push(text);
                }
            });

            if (!isbn) {
                console.warn(`[DEBUG] No ISBN found for Kırmızı Kedi page: ${url}`);
                if (attempt < retries) continue;
                return null;
            }

            return {
                title: decodeHtmlEntities(title),
                author: decodeHtmlEntities(author),
                publisher: decodeHtmlEntities(publisher),
                price: priceText,
                originalPrice: originalPriceText,
                isbn,
                inStock,
                imageUrl,
                categories,
                url
            };
        } catch (error: any) {
            console.error(`[ERROR] Kırmızı Kedi Scrape Attempt ${attempt} failed: ${error.message}`);
            if (attempt < retries) await jitter(2000, 5000);
            else return null;
        }
    }
    return null;
}

/**
 * Discovers book URLs from a category page.
 */
export async function discoverBooksFromKirmiziKediCategory(categoryUrl: string, maxPages: number = 1): Promise<string[]> {
    const bookUrls: string[] = [];

    for (let page = 1; page <= maxPages; page++) {
        try {
            const url = page > 1 ? `${categoryUrl}/${page}` : categoryUrl;
            console.log(`Discovering Kırmızı Kedi books from: ${url}`);

            let response;
            try {
                response = await axios.get(url, { headers: getHeaders(), timeout: 30000 });
            } catch (err) {
                console.warn(`[WARN] Kırmızı Kedi discovery direct failed, using ScraperAPI...`);
                response = await axios.get(buildScraperApiUrl(url, true), { headers: getHeaders(), timeout: 90000 });
            }

            const html = response.data;
            console.log(`[DEBUG] Kırmızı Kedi discovery page ${page} HTML length: ${html.length}`);
            const $ = cheerio.load(html);

            let pageBooksCount = 0;
            // Target any link that looks like a product page
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && (href.includes('-p-') || href.match(/-p-\d+$/))) {
                    const fullUrl = href.startsWith('http') ? href : `https://www.kirmizikedi.com${href.startsWith('/') ? '' : '/'}${href}`;
                    if (!bookUrls.includes(fullUrl)) {
                        bookUrls.push(fullUrl);
                        pageBooksCount++;
                    }
                }
            });

            console.log(`Found ${pageBooksCount} books on Kırmızı Kedi page ${page}.`);
            if (pageBooksCount === 0) break;

            await jitter(1000, 2000);
        } catch (error: any) {
            console.error(`[ERROR] Kırmızı Kedi discovery error on page ${page}: ${error.message}`);
            break;
        }
    }

    return bookUrls;
}

/**
 * Fast mode: Scrape cards directly from list pages.
 */
export async function scrapeKirmiziKediFromList(categoryUrl: string, page: number): Promise<Partial<ScrapedBook>[]> {
    try {
        const url = page > 1 ? `${categoryUrl}/${page}` : categoryUrl;
        let response;
        try {
            response = await axios.get(url, { headers: getHeaders(), timeout: 30000 });
        } catch (err) {
            response = await axios.get(buildScraperApiUrl(url, true), { headers: getHeaders(), timeout: 90000 });
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const books: Partial<ScrapedBook>[] = [];

        $('.product-item').each((i, el) => {
            const card = $(el);
            const titleLink = card.find('a.product-title');
            const title = titleLink.text().trim();
            const href = titleLink.attr('href');
            const url = href ? (href.startsWith('http') ? href : `https://www.kirmizikedi.com${href}`) : '';

            const rawPrice = card.find('.product-price').text().trim();
            const price = rawPrice.split('\n').filter((p: string) => p.trim() && p.includes('TL')).pop()?.trim() || rawPrice;
            const originalPrice = card.find('.product-price-old').text().trim();
            const inStock = card.find('.add-to-basket.in-stock').length > 0 ||
                (card.find('.add-to-basket').length > 0 && !card.find('.add-to-basket').hasClass('no-stock')) ||
                (!card.text().toLowerCase().includes('tükendi') && !card.text().toLowerCase().includes('stokta yok'));

            if (url && price) {
                books.push({
                    title: decodeHtmlEntities(title),
                    url,
                    price,
                    originalPrice,
                    inStock
                });
            }
        });

        return books;
    } catch (error) {
        return [];
    }
}
