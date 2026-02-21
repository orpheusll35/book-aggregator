const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_sepette.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Price Check ---');
console.log('Sale Price:', $('.salePrice').text().trim());
console.log('Old Price:', $('.oldPrice').text().trim());
console.log('Campaign Price:', $('.campaign-price').text().trim());
console.log('Basket Price Label:', $('.campaign-price-label').text().replace(/\s+/g, ' ').trim());
