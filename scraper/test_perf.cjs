require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testPerformance() {
    console.log('Testing "updated_at" sort on 300k rows...');
    let start = Date.now();
    const { data: d1, error: e1 } = await supabase.from("books").select('id').order('updated_at', { ascending: false }).limit(10);
    console.log('fetchBooks time (ms):', Date.now() - start);
    if (e1) console.error(e1);

    console.log('\nTesting "view_count" sort on 300k rows...');
    start = Date.now();
    const { data: d2, error: e2 } = await supabase.from("books").select('id, book_prices!inner(id)').eq('book_prices.in_stock', true).order('view_count', { ascending: false }).limit(10);
    console.log('fetchFeatured time (ms):', Date.now() - start);
    if (e2) console.error(e2);

    console.log('\nTesting "created_at" sort on 300k rows...');
    start = Date.now();
    const { data: d4, error: e4 } = await supabase.from("books").select('id').order('created_at', { ascending: false }).limit(10);
    console.log('fetchNewArrivals time (ms):', Date.now() - start);
    if (e4) console.error(e4);

    console.log('\nTesting "id" sort on 300k rows (indexed)...');
    start = Date.now();
    const { data: d3, error: e3 } = await supabase.from("books").select('id').order('id', { ascending: false }).limit(10);
    console.log('fetchFallback time (ms):', Date.now() - start);
    if (e3) console.error(e3);
}

testPerformance();
