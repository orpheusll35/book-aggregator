const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('axios_test.html', 'utf8');
const $ = cheerio.load(html);

const data = {
    price: $('.salePrice').text().trim(),
    originalPrice: $('.oldPrice').text().trim() || $('.old-price').text().trim(),
    publisher: $('a[href*=\'yayinevi\']').first().text().trim()
};

// Check for ISBN (978...) using regex in all text
let textStr = $('body').text().replace(/\s+/g, ' ');
let match = textStr.match(/978\d{10}/);
if (match) {
    data['globalRegEx'] = match[0];
} else if (textStr.includes('978-')) {
    data['globalRegExDashed'] = textStr.match(/978[-\d]+/)[0];
}

// Check meta tags or specific script tags
$('script').each((i, el) => {
    let t = $(el).html();
    if (t && t.includes('978')) {
        let m = t.match(/978\d{10}/);
        if (m) data['scriptIsbn'] = m[0];
    }
});

// Check meta tags
$('meta').each((i, el) => {
    if ($(el).attr('content') && $(el).attr('content').includes('978')) {
        data['metaIsbn'] = $(el).attr('content');
    }
});

fs.writeFileSync('result_isbn.json', JSON.stringify(data, null, 2), 'utf8');
