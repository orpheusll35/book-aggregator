import { supabase } from './src/supabase';
import fs from 'fs';

async function main() {
    const { data, error } = await supabase.from('books').select('title, book_prices(price, original_price, stores(name))').eq('id', '0f6dc03c-88d9-445f-b315-cbb7d13c7079');
    if (error) { console.error(error); return; }
    fs.writeFileSync('book_price.json', JSON.stringify(data?.[0], null, 2));
}

main();
