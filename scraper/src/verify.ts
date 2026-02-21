import { supabase } from './supabase';

async function verify() {
    console.log("Checking stores table...");
    const { data: stores, error: storesError } = await supabase.from('stores').select('*');
    console.log("Stores:", stores, storesError);

    console.log("\nChecking books table...");
    const { data: books, error: booksError } = await supabase.from('books').select('*');
    console.log("Books:", books, booksError);

    console.log("\nChecking book_prices table...");
    const { data: prices, error: pricesError } = await supabase.from('book_prices').select('*');
    console.log("Prices:", prices, pricesError);
}

verify();
