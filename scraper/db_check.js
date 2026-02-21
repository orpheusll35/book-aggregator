const { supabase } = require('./src/supabase');

async function check() {
    const { data, error } = await supabase.from('books').select('title, image_url, book_prices(url)');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

check();
