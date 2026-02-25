require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testQuery() {
    console.log('Testing featured books global fetch...');
    console.time('featuredGlobal');

    // Idea for featured globally: we can't sort by `books.view_count` on `book_prices` directly because view_count isn't on `book_prices` and joining and sorting is slow.
    // However, what if we get the top 50 books by view_count globally from the `books` table first (no join),
    // and then fetch their valid `book_prices` if they are in stock?
    const { data: popularBooks, error: e1 } = await supabase
        .from('books')
        .select('id, view_count')
        .order('view_count', { ascending: false })
        .limit(100);

    if (e1) return console.error(e1);
    const bookIds = popularBooks.map(b => b.id);

    const { data: prices, error: e2 } = await supabase
        .from('book_prices')
        .select(`price, original_price, url, in_stock, stores(name), books!inner(*)`)
        .eq('in_stock', true)
        .in('book_id', bookIds);

    console.timeEnd('featuredGlobal');
    if (e2) return console.error(e2);

    console.log('Got prices for', prices.length, 'popular books');
    if (prices.length > 0) console.log(prices[0].books.title);
}

testQuery();
