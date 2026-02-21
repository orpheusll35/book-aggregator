const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_sepette.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Campaign Price Debug ---');
$('.campaign-price').each((i, el) => {
    console.log('Text:', $(el).text().trim());
    console.log('HTML:', $(el).html());
    console.log('Parent Class:', $(el).parent().attr('class'));
    console.log('Grandparent Class:', $(el).parent().parent().attr('class'));
});

// Let's also search for anything containing "sepette"
$('*').each((i, el) => {
    const text = $(el).text();
    if (text.toLowerCase().includes('sepette') && text.length < 100) {
        console.log('Match:', text.trim(), 'Class:', $(el).attr('class'));
    }
});
