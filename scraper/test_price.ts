import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
    const url = "https://www.kirmizikedi.com/kim-korkar-yapay-zekadan-is-hayatinda-yapay-zeka-p-766738";
    console.log("Fetching book page with ScraperAPI (TR)...");
    const apiKey = "ba5a749dbae9e358b05f32297785b8a3";
    const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true&country_code=tr`;

    try {
        const { data } = await axios.get(scraperUrl);
        const $ = cheerio.load(data);

        console.log("Title: ", $('h1').text().trim());

        // Log all price elements text length
        const priceEls = $('.product-price');
        console.log(`Found ${priceEls.length} .product-price elements.`);

        priceEls.each((i, el) => {
            console.log(`${i}:`, $(el).text().trim().replace(/\s+/g, ' '));
        });

        console.log("\nSpecific tags:");
        console.log("#product-detail .product-price =>", $('#product-detail .product-price').first().text().trim().replace(/\s+/g, ' '));
        console.log(".discount-price =>", $('.discount-price').text().trim().replace(/\s+/g, ' '));

    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}
test();
