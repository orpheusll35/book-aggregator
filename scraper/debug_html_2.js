const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- OG Tags ---');
$('meta').each((i, el) => {
    const property = $(el).attr('property');
    const name = $(el).attr('name');
    const content = $(el).attr('content');
    if ((property || name) && content) {
        if ((property && property.includes('og:')) || (name && name.includes('twitter:'))) {
            console.log(`${property || name}: ${content}`);
        }
    }
});

console.log('--- Image Selectors Check ---');
const mainImg = $('.product-image img').first();
console.log('Main Image Src:', mainImg.attr('src'));
console.log('Main Image Data-Src:', mainImg.attr('data-src'));

const lazyImgs = $('img.lazyload');
console.log('Lazy Images Count:', lazyImgs.length);
lazyImgs.each((i, el) => {
    console.log(`Lazy ${i} data-src:`, $(el).attr('data-src'));
});

console.log('--- Category Extraction ---');
const cats = [];
$('ul.breadcrumb li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text !== 'Ana sayfa' && text !== 'Kitap') {
        cats.push(text);
    }
});
console.log('Final Categories:', cats);
