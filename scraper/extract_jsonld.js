const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('axios_test.html', 'utf8');
const $ = cheerio.load(html);

let jsonLd = null;
$('script[type="application/ld+json"]').each((i, el) => {
    try {
        const data = JSON.parse($(el).html());
        console.log("Found JSON-LD Type:", data['@type']);
        if (data['@type'] === 'Product' || data['@type'] === 'Book') {
            jsonLd = data;
        }
    } catch (e) { }
});

if (jsonLd) {
    fs.writeFileSync('result_jsonld.json', JSON.stringify(jsonLd, null, 2), 'utf8');
    console.log("Saved JSON-LD to result_jsonld.json");
} else {
    console.log("No Product JSON-LD found");
}
