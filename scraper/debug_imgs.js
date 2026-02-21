const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- ALL IMAGES ---');
$('img').each((i, el) => {
    console.log(`IMG ${i}:`);
    console.log(`  src: ${$(el).attr('src')}`);
    console.log(`  data-src: ${$(el).attr('data-src')}`);
    console.log(`  class: ${$(el).attr('class')}`);
    console.log(`  alt: ${$(el).attr('alt')}`);
});

console.log('--- META OG:IMAGE ---');
console.log($('meta[property="og:image"]').attr('content'));
