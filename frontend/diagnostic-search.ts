
import { supabase } from './src/lib/supabase';

async function debugSearch(query: string) {
    console.log(`\n--- Debugging Search for: "${query}" ---`);

    const cleanQuery = query.replace(/[%_,()]/g, '');
    const wildcard = cleanQuery.replace(/[iİıI]/g, '_');

    console.log(`Clean Query: ${cleanQuery}`);
    console.log(`Wildcard: ${wildcard}`);

    const orString = `title.ilike.%${cleanQuery}%,author.ilike.%${cleanQuery}%,title.ilike.%${wildcard}%,author.ilike.%${wildcard}%`;
    console.log(`OR String: ${orString}`);

    try {
        const { data, error, count } = await supabase
            .from("books")
            .select('*', { count: 'exact', head: false })
            .or(orString)
            .order('view_count', { ascending: false })
            .order('id', { ascending: true })
            .limit(10);

        if (error) {
            console.error("Supabase Error:", error.message);
            console.error("Error Hint:", error.hint);
            console.error("Error Details:", error.details);
        } else {
            console.log(`Success! Found ${data?.length} results in top 10.`);
            console.log(`Total count in DB: ${count}`);
            data?.forEach(b => console.log(` - ${b.title} (${b.author})`));
        }
    } catch (e: any) {
        console.error("Exception:", e.message);
    }
}

async function run() {
    await debugSearch("düşün");
    await debugSearch("içimizdeki");
    await debugSearch("test,comma"); // This should be cleaned
}

run();
