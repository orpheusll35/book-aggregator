import { supabase } from './src/supabase';
import fs from 'fs';

async function main() {
    const { data, error } = await supabase.from('books').select('title, book_prices(price, original_price, stores(name))').eq('id', '7c7e75f0-bb55-42f0-bd79-b5e69007d99f');
    if (error) { console.error(error); return; }
    fs.writeFileSync('book_check.json', JSON.stringify(data, null, 2));
}

main();
