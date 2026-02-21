import { request } from 'undici';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function scrapeDR(url: string) {
    try {
        console.log(`Fetching D&R page: ${url}`);

        // We set a User-Agent to avoid being blocked by basic bot protections.
        const response = await request(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        const html = await response.body.text();
        fs.writeFileSync('test_dr.html', html, 'utf8');
        const $ = cheerio.load(html);

        let title = ($('h1').text().trim() || $('.product-name').text().trim()).replace(/^Cover of\s+/i, '');

        const campaignPriceText = $('.campaign-price').text().trim();
        const salePriceText = $('.salePrice').text().trim() || $('.product-price').text().trim() || $('.discount-price').text().trim();
        let originalPriceText = $('.oldPrice').text().trim() || $('.old-price').text().trim() || $('.original-price').text().trim();

        let priceText = campaignPriceText || salePriceText;
        if (campaignPriceText && salePriceText && !originalPriceText) {
            originalPriceText = salePriceText;
        }

        const author = $('.author a').first().text().trim() || $('.product-author a').text().trim();

        let publisher = '';
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.toLowerCase().includes('yayinevi')) {
                const text = $(el).text().trim();
                if (text && !publisher) publisher = text;
            }
        });

        // 1. Image: Multi-selector and fallback
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

        // Fix protocol-relative URLs
        if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
        }
        console.log(`Image URL: ${imageUrl}`);

        // 2. Categories: Extract from breadcrumbs (Skip Home and Books)
        const categories: string[] = [];
        $('ul.breadcrumb li').each((i, el) => {
            const text = $(el).text().trim();
            if (text && !['Ana sayfa', 'Kitap'].includes(text)) {
                categories.push(text);
            }
        });

        // 3. ISBN
        let isbn = '';
        const bodyText = $('body').text().replace(/\s+/g, ' ');
        const isbnMatch = bodyText.match(/978\d{10}/);
        if (isbnMatch) {
            isbn = isbnMatch[0];
        }

        const inStock = !html.toLowerCase().includes('tükendi') && !html.toLowerCase().includes('temin edilememektedir');

        // Print result
        const result = {
            title,
            author,
            publisher,
            price: priceText,
            originalPrice: originalPriceText,
            isbn,
            inStock,
            imageUrl,
            categories,
            url
        };

        console.log('--- Scraped Data ---');
        console.log(JSON.stringify(result, null, 2));

        if (!isbn) {
            console.log("No ISBN found. Cannot save to database.");
            return;
        }

        // --- Database Upsert Logic ---
        console.log("Saving to Supabase...");
        const { supabase } = require('./supabase');

        // 1. Get Store ID for D&R
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('name', 'D&R')
            .single();

        if (storeError) throw new Error(`Could not find D&R store in database. Did you run the SQL? Error: ${storeError.message}`);

        // 2. Upsert Book (Conflict on ISBN)
        const { data: book, error: bookError } = await supabase
            .from('books')
            .upsert({
                isbn: result.isbn,
                title: result.title,
                author: result.author,
                publisher: result.publisher,
                image_url: result.imageUrl,
                categories: result.categories
            }, { onConflict: 'isbn', ignoreDuplicates: false })
            .select('id')
            .single();

        if (bookError) throw new Error(`Could not upsert book: ${bookError.message}`);

        // 3. Upsert Book Price (Conflict on book_id and store_id)
        const { error: priceError } = await supabase
            .from('book_prices')
            .upsert({
                book_id: book.id,
                store_id: store.id,
                price: result.price,
                original_price: result.originalPrice,
                in_stock: result.inStock,
                url: result.url
            }, { onConflict: 'book_id, store_id' });

        if (priceError) throw new Error(`Could not upsert price: ${priceError.message}`);

        console.log("Successfully saved to Supabase!");

    } catch (error: any) {
        console.error(`Error scraping D&R: ${error.message}`);
    }
}

// Target a list of diverse books to demonstrate categories/images
const testUrls = [
    'https://www.dr.com.tr/Kitap/Kurk-Mantolu-Madonna/Sabahattin-Ali/Edebiyat/Roman/Turk-Klasik/urunno=0000000058245',
    'https://www.dr.com.tr/Kitap/Atomik-Aliskanliklar/James-Clear/Egitim-Basvuru/Kisisel-Gelisim/urunno=0001859345001',
    'https://www.dr.com.tr/Kitap/Nutuk-Gunumuz-Turkcesiyle/Mustafa-Kemal-Ataturk/Arastirma-Inceleme/Cumhuriyet-Tarihi/urunno=0000000182650',
    'https://www.dr.com.tr/Kitap/Sapiens-Hayvanlardan-Tanrilara-Insan-Turunun-Kisa-Bir-Tarihi/Yuval-Noah-Harari/Arastirma-Inceleme/Tarih/Antropoloji/urunno=0000000661725'
];

async function runScraper() {
    for (const url of testUrls) {
        await scrapeDR(url);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

runScraper();
