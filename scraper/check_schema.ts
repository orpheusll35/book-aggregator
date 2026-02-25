import { supabase } from './src/supabase';

async function checkSchema() {
    console.log("Checking Live Schema...");
    const { data, error } = await supabase.from('books').select('*').limit(1);

    if (error) {
        console.error("Error connecting to Supabase:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("Columns in 'books' table:", Object.keys(data[0]));
        console.log("Categories value sample:", data[0].categories);
        console.log("Categories type:", typeof data[0].categories);
    } else {
        console.log("Books table is empty.");
    }

    const { data: prices } = await supabase.from('book_prices').select('*').limit(1);
    if (prices && prices.length > 0) {
        console.log("\nColumns in 'book_prices' table:", Object.keys(prices[0]));
    }
}

checkSchema();
