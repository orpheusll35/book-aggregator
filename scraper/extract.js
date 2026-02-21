const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('axios_test.html', 'utf8');
const $ = cheerio.load(html);

const data = {
    price1: $('#salePrice').text().trim(),
    price2: $('.salePrice').text().trim(),
    price3: $('.prd-price-wrapper *').text().replace(/\s+/g, ' ').trim(),
    publisher1: $('.publisher').text().trim(),
    publisher2: $('a[href*=\'Yayinevi\']').text().trim(),
    publisher3: $('a[href*=\'yayinevi\']').text().trim(),
    isbnText: $('h1').parent().text().replace(/\s+/g, ' ').substring(0, 500)
};

// Also look directly for any data attributes that might have the ISBN
$('*').each((i, el) => {
    const dataIsbn = $(el).attr('data-isbn') || $(el).attr('data-barkod');
    if (dataIsbn) {
        data['dataIsbn'] = dataIsbn;
    }
});

// Look for data-price
$('*').each((i, el) => {
    const priceAttr = $(el).attr('data-price');
    if (priceAttr && priceAttr.includes('58')) {
        data['dataPriceAttr'] = priceAttr;
        data['dataPriceClass'] = $(el).attr('class');
        data['dataPriceId'] = $(el).attr('id');
    }
});

fs.writeFileSync('result.json', JSON.stringify(data, null, 2), 'utf8');
