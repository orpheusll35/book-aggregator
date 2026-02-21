const { supabase } = require('./src/supabase');

async function checkPrice() {
    const { data, error } = await supabase
        .from('books')
        .select('title, book_prices(price, original_price)')
        .eq('title', 'Kürk Mantolu Madonna')
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Title: ${data.title}`);
    data.book_prices.forEach(p => {
        console.log(`Price: ${p.price}, Original: ${p.original_price}`);
    });
}

checkPrice();
