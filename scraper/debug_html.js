const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Breadcrumbs ---');
$('ul.breadcrumb li').each((i, el) => {
    console.log(`Li ${i}:`, $(el).text().trim());
});

console.log('--- Higher Level Breadcrumb divs ---');
$('.breadcrumb li').each((i, el) => {
    console.log(`Breadcrumb ${i}:`, $(el).text().trim());
});

console.log('--- All meta tags (often have category/image) ---');
$('meta').each((i, el) => {
    const name = $(el).attr('name') || $(el).attr('property');
    const content = $(el).attr('content');
    if (name && content && (name.includes('image') || name.includes('category'))) {
        console.log(`${name}: ${content}`);
    }
});

console.log('--- Possible Image Selectors ---');
console.log('Main image src:', $('#product-image, .product-image img').attr('src'));
console.log('Lazy image data-src:', $('img.lazyload').attr('data-src'));
console.log('All images on page count:', $('img').length);
