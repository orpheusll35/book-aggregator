import { request } from 'undici';

async function probe() {
    const urls = [
        'https://www.dr.com.tr/kategori/edebiyat',
        'https://www.dr.com.tr/kategori/kitap/edebiyat',
        'https://www.dr.com.tr/kitap/edebiyat',
        'https://www.dr.com.tr/kategori/egitim-ve-sinav-kitaplari',
        'https://www.dr.com.tr/kategori/kitap/arastirma-tarih'
    ];

    console.log("Probing clean URLs...");
    for (const u of urls) {
        try {
            const r = await request(u, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                bodyTimeout: 5000,
                headersTimeout: 5000
            });
            console.log(`${u} -> ${r.statusCode}`);
        } catch (e: any) {
            console.log(`${u} -> ${e.message}`);
        }
    }
}
probe();
