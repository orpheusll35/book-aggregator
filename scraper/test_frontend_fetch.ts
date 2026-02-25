import { supabase } from './src/supabase';

async function testFetch() {
    console.log("Simulating frontend fetchBooks()...");
    const { data: dbBooks, error } = await supabase
        .from("books")
        .select(`
      *,
      book_prices (
        price,
        original_price,
        url,
        in_stock,
        stores (
          name
        )
      )
    `);

    if (error) {
        console.error("Supabase Error:", error.message);
        return;
    }

    console.log(`Total books from query: ${dbBooks?.length}`);

    const mappedBooks = (dbBooks || []).map((b: any) => {
        const vendors = b.book_prices?.map((bp: any) => ({
            name: bp.stores?.name,
            inStock: bp.in_stock
        })) || [];

        return {
            id: b.id,
            title: b.title,
            vendors
        };
    });

    const withKK = mappedBooks.filter(b => b.vendors.some(v => v.name === 'Kırmızı Kedi'));
    console.log(`Books with Kırmızı Kedi vendors: ${withKK.length}`);

    if (withKK.length > 0) {
        console.log("Sample Kırmızı Kedi Book in mapped data:", withKK[0]);
    } else {
        console.log("WARNING: NO BOOKS FOUND WITH KIRMIZI KEDI VENDORS IN MAPPED DATA!");
        // Let's see what's in the first book's vendors
        if (mappedBooks.length > 0) {
            console.log("First book vendors names:", mappedBooks[0].vendors.map(v => v.name));
        }
    }
}

testFetch();
