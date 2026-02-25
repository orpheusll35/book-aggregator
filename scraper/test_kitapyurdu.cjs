const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function check() {
    try {
        const r = await axios.get('https://www.kitapyurdu.com/kategori/kitap-edebiyat/1_128.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        fs.writeFileSync('kitapyurdu.html', r.data);
        console.log('Saved kitapyurdu.html, length: ' + r.data.length);

        const $ = cheerio.load(r.data);
        const books = $('.product-cr');
        console.log('Found ' + books.length + ' books with .product-cr');

        const altBooks = $('.product-list .product');
        console.log('Found ' + altBooks.length + ' books with .product-list .product');
    } catch (e) {
        console.error('Error fetching:', e.message);
    }
}
check();
