const axios = require('axios');
const fs = require('fs');

async function fetch() {
    try {
        const url = 'https://www.dr.com.tr/Kitap/Kurk-Mantolu-Madonna/Sabahattin-Ali/Edebiyat/Roman/Turk-Klasik/urunno=0000000058245';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('test_sepette.html', response.data);
        console.log('Saved to test_sepette.html');
    } catch (e) {
        console.error(e.message);
    }
}

fetch();
