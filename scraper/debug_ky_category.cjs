const axios = require('axios');
const fs = require('fs');

async function debug() {
    const url = 'https://www.kitapyurdu.com/kategori/kitap/1.html';
    const r = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    fs.writeFileSync('ky_category_debug.html', r.data);
    console.log('Saved category page, size:', r.data.length);
}
debug().catch(console.error);
