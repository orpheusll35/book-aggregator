require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testFast() {
    console.log('Testing fast query via book_prices...');
    console.time('fetchFast');

    const { data, error } = await supabase
        .from('book_prices')
        .select(`
            price,
            original_price,
            url,
            in_stock,
            stores (name),
            books!inner(*)
        `)
        .eq('in_stock', true)
        .limit(60);

    console.timeEnd('fetchFast');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Returned rows:', data.length);
        if (data.length > 0) {
            console.log('Sample book title:', data[0].books.title);
        }
    }
}

testFast();
