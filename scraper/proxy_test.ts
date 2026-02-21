import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function testPuppeteer() {
    console.log("Testing Puppeteer Stealth with Proxy...");
    const proxyUrl = "31.59.20.176:6754";

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--proxy-server=http://${proxyUrl}`,
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    const page = await browser.newPage();
    await page.authenticate({ username: 'rhshspdm', password: 'u6xe4cu8nchl' });

    try {
        console.log("Navigating to D&R...");
        const response = await page.goto('https://www.dr.com.tr/kategori/kitap', { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log("Status:", response?.status());
        console.log("Title:", await page.title());

        // Let it sit for a few seconds to process any JS challenges
        await new Promise(r => setTimeout(r, 5000));
        console.log("Title after 5s:", await page.title());
    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        await browser.close();
    }
}

testPuppeteer();
