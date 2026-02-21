const { supabase } = require('./src/supabase');

async function verify() {
    const { data: books, error } = await supabase
        .from('books')
        .select('*');

    if (error) {
        console.error("Error fetching books:", error);
        return;
    }

    console.log(`Found ${books.length} books.`);
    books.forEach(b => {
        console.log(`- ${b.title} [ISBN: ${b.isbn}]`);
        console.log(`  Categories: ${JSON.stringify(b.categories)}`);
        console.log(`  Image: ${b.image_url.substring(0, 50)}...`);
    });
}

verify();
