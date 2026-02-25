require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing inner join...');
    const { data: dbBooks, error } = await supabase
        .from("books")
        .select(`
            *,
            book_prices!inner (
                price,
                original_price,
                url,
                in_stock,
                stores (name)
            )
        `)
        .eq('book_prices.in_stock', true)
        .order('view_count', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log('Returned Books Count:', dbBooks ? dbBooks.length : 0);
    }
}
test();
