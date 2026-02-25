import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''; // Use ANON key to simulate frontend

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin() {
    console.log("Testing Join as ANON user...");
    const { data: books, error } = await supabase
        .from('books')
        .select(`
            id,
            title,
            book_prices (
                price,
                stores (
                    name
                )
            )
        `)
        .limit(100);

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Fetched ${books?.length} books.`);

    let countWithKK = 0;
    books?.forEach(b => {
        const prices = b.book_prices as any[];
        const hasKK = prices?.some(p => p.stores?.name === 'Kırmızı Kedi');
        if (hasKK) countWithKK++;
    });

    console.log(`Books with Kırmızı Kedi prices: ${countWithKK}`);

    if (countWithKK === 0 && books && books.length > 0) {
        console.log("Detailed check of first book prices:");
        console.log(JSON.stringify(books[0].book_prices, null, 2));
    }
}

testJoin();
