const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Scanning for Image URLs ---');
$('img').each((i, el) => {
    const src = $(el).attr('src');
    const dataSrc = $(el).attr('data-src');
    const alt = $(el).attr('alt');
    if ((src && src.includes('cache')) || (dataSrc && dataSrc.includes('cache')) || (alt && alt.toLowerCase().includes('kürk'))) {
        console.log(`Img ${i}: src=${src}, data-src=${dataSrc}, alt=${alt}`);
    }
});

console.log('--- Scanning for og:image specifically ---');
console.log('og:image meta:', $('meta[property="og:image"]').attr('content'));

console.log('--- Breadcrumbs Logic ---');
const categories = [];
$('ul.breadcrumb li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && !['Ana sayfa', 'Kitap'].includes(text)) {
        categories.push(text);
    }
});
console.log('Detected Categories:', categories);
