import { supabase } from './src/supabase';

async function diagnose() {
    console.log("--- DATABASE DIAGNOSIS ---");

    // 1. Get Stores
    const { data: stores } = await supabase.from('stores').select('id, name');
    console.log("Stores in DB:", stores);

    // 2. Count Prices per Store
    for (const store of stores || []) {
        const { count } = await supabase
            .from('book_prices')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', store.id);
        console.log(`Prices for ${store.name}: ${count}`);
    }

    // 3. Sample Kırmızı Kedi Books
    const kkStore = stores?.find(s => s.name === 'Kırmızı Kedi');
    if (kkStore) {
        console.log("\nSample Kırmızı Kedi Records:");
        const { data: samples } = await supabase
            .from('book_prices')
            .select('books(id, title, isbn), price, url')
            .eq('store_id', kkStore.id)
            .limit(5);

        samples?.forEach((s: any) => {
            console.log(`- Title: ${s.books?.title} | ISBN: ${s.books?.isbn} | Price: ${s.price}`);
        });
    }

    // 4. Check for ISBN overlaps
    console.log("\nChecking for Cross-Store ISBN Overlaps...");
    const { data: allPrices } = await supabase
        .from('book_prices')
        .select('book_id, store_id, stores(name)');

    const overlapMap: Record<string, string[]> = {};
    allPrices?.forEach((p: any) => {
        if (!overlapMap[p.book_id]) overlapMap[p.book_id] = [];
        overlapMap[p.book_id].push(p.stores.name);
    });

    const overlaps = Object.entries(overlapMap).filter(([id, names]) => names.length > 1);
    console.log(`Total books with prices from multiple stores: ${overlaps.length}`);
    if (overlaps.length > 0) {
        console.log("Example overlap:", overlaps[0]);
    }
}

diagnose();
