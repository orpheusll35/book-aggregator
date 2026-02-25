import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('books').select('categories');
    if (error) {
        console.error(error);
        return;
    }
    const cats: Record<string, number> = {};
    (data || []).forEach(b => {
        if (b.categories) {
            b.categories.forEach((c: string) => {
                cats[c] = (cats[c] || 0) + 1;
            });
        }
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    fs.writeFileSync('categories_with_counts.txt', sorted.map(([name, count]) => `${name}: ${count}`).join('\n'));
    console.log(`Found ${sorted.length} categories. Written to categories_with_counts.txt`);
}


check();
