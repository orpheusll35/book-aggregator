
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qagamzygcqdqwnlaprek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ2FtenlnY3FkcXdubGFwcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzOTAsImV4cCI6MjA4NzIwMDM5MH0.h40IgtJi_fljQJCcZ0Pp1kJvuHp-pEfpll52nyeZQBI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSearch(query) {
    console.log(`\n--- Debugging Search for: "${query}" ---`);

    // Logic from search.json.ts
    const cleanQuery = query.replace(/[%_,()]/g, '');
    const wildcard = cleanQuery.replace(/[iİıI]/g, '_');

    const orString = `title.ilike.%${cleanQuery}%,author.ilike.%${cleanQuery}%,title.ilike.%${wildcard}%,author.ilike.%${wildcard}%`;
    console.log(`OR String: ${orString}`);

    try {
        const { data, error, count } = await supabase
            .from("books")
            .select('title, author, view_count, id', { count: 'exact' })
            .or(orString)
            .order('view_count', { ascending: false })
            .order('id', { ascending: true })
            .limit(10);

        if (error) {
            console.error("Supabase Error:", error.message);
        } else {
            console.log(`Success! Found ${data?.length} results in top 10.`);
            console.log(`Total count in DB for this query: ${count}`);
            data?.forEach(b => console.log(` - ${b.title} (${b.author}) [view_count: ${b.view_count}]`));
        }
    } catch (e) {
        console.error("Exception:", e.message);
    }
}

async function run() {
    await debugSearch("düşün");
    await debugSearch("dusun");
    await debugSearch("içimizdeki");
}

run();
