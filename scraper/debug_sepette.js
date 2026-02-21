const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Searching for "Sepette" ---');
$('*').each((i, el) => {
    const text = $(el).text();
    if (text.includes('Sepette') || text.includes('sepette')) {
        // Only print if it's a small element (likely the price tag)
        if (text.length < 100) {
            console.log(`Tag: ${el.tagName}, Class: ${$(el).attr('class')}, Text: "${text.trim()}"`);
        }
    }
});
