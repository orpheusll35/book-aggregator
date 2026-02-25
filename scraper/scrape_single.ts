import { scrapeDRPage } from './src/scraper-dr';
import { syncToDatabase } from './src/processor';

async function main() {
    const url = "https://www.dr.com.tr/kitap/karartma-geceleri-butun-eserleri/edebiyat/roman/turkiye-roman/urunno=0001690480001";
    console.log(`Starting manual scrape for: ${url}`);

    const data = await scrapeDRPage(url);
    if (data) {
        console.log(`Scraped Data:`, data);
        const success = await syncToDatabase(data, "D&R");
        if (success) {
            console.log(`Successfully synced to database!`);
        } else {
            console.error(`Failed to sync to database.`);
        }
    } else {
        console.error(`Failed to scrape data from the URL.`);
    }
}

main();
