const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_dr.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Debugging Data ---');
console.log('H1:', $('h1').text().trim());
console.log('Product Name Class:', $('.product-name').text().trim());
console.log('OG Title:', $('meta[property="og:title"]').attr('content'));
console.log('Twitter Title:', $('meta[name="twitter:title"]').attr('content'));

const img = $('.product-image img').first();
console.log('Img Src:', img.attr('src'));
console.log('Img Data-Src:', img.attr('data-src'));
console.log('Img Data-Original:', img.attr('data-original'));

const ogImg = $('meta[property="og:image"]').attr('content');
console.log('OG Image:', ogImg);
