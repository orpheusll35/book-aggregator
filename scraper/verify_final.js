const { supabase } = require('./src/supabase');

async function verify() {
    const { data: books, error } = await supabase
        .from('books')
        .select(`
            id,
            title,
            image_url,
            book_prices (
                url
            )
        `);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("--- FINAL DATA CHECK ---");
    books.forEach(b => {
        console.log(`Title: "${b.title}"`);
        console.log(`Image: ${b.image_url}`);
        const urls = b.book_prices?.map(p => p.url) || [];
        console.log(`URLs: ${urls.join(', ')}`);
        console.log('---');
    });
}

verify();
