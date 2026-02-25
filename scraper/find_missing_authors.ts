import { supabase } from './src/supabase';

async function checkMissingAuthors() {
    const { data: storeData } = await supabase.from('stores').select('id').eq('name', 'Kırmızı Kedi').single();
    if (!storeData) return console.log("Kırmızı Kedi not found");

    const { data: books, error } = await supabase
        .from('book_prices')
        .select(`url, books!inner(author, title)`)
        .eq('store_id', storeData.id);

    if (error) {
        console.error("Error fetching books:", error);
        return;
    }

    let missingCount = 0;
    const missingExamples: any[] = [];
    books.forEach((b: any) => {
        const author = b.books?.author;
        if (!author || author.trim() === '') {
            missingCount++;
            if (missingExamples.length < 5) missingExamples.push(b);
        }
    });

    console.log(`TOTAL MISSING AUTHORS FOR KIRMIZI KEDI: ${missingCount}`);
    console.log("Examples:");
    missingExamples.forEach(e => console.log(`- ${e.books.title}: ${e.url}`));
}

checkMissingAuthors();
