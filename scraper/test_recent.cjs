require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testNew() {
    console.log('Testing recent fetch...');

    const { data: recentBooks, error: recentError } = await supabase
        .from('books')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(150);

    if (recentError) return console.error(recentError);
    const recentIds = recentBooks.map(b => b.id);

    console.log('Got recent book ids:', recentIds.length);

    const { data: prices, error: e2 } = await supabase
        .from('book_prices')
        .select(`price, in_stock, books!inner(title)`)
        .eq('in_stock', true)
        .in('book_id', recentIds);

    if (e2) return console.error(e2);

    console.log('Got prices for', prices.length, 'recent books');
}

testNew();
