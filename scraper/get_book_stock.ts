import { supabase } from './src/supabase';
import fs from 'fs';

async function main() {
    const { data, error } = await supabase.from('books').select('title, book_prices(price, in_stock, stores(name))').eq('id', '7c7e75f0-bb55-42f0-bd79-b5e69007d99f');
    if (error) { console.error(error); return; }
    fs.writeFileSync('book_stock.json', JSON.stringify(data?.[0], null, 2));
}

main();
