import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { mapDbBookToBook } from '@/lib/fetchBooks';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const categoriesParam = url.searchParams.get('categories') || '';
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    if (!query && categories.length === 0) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    let supabaseQuery = supabase
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

    if (query) {
        // Build a broad search pattern to overcome Postgres collation issues
        // We search for both 'i' and 'İ' versions if 'i' or 'ı' is in the query
        const trQuery = query.replace(/i/g, 'İ').replace(/ı/g, 'I');
        const altQuery = query.replace(/İ/g, 'i').replace(/I/g, 'ı');

        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,title.ilike.%${trQuery}%,title.ilike.%${altQuery}%`);
    }

    // We don't filter by categories in the supabaseQuery anymore, 
    // because its raw categories vs our simplified categories.
    // We will filter in-memory from the result set.

    // Supabase has a default limit of 1000, which is fine for a search result
    const { data: dbBooks, error } = await supabaseQuery.limit(1000);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const books = (dbBooks || []).map(mapDbBookToBook).filter(book => {
        // Final precise filter in JS using Turkish locale
        const searchQueryNormalized = query.toLocaleLowerCase('tr-TR');
        const titleMatches = book.title.toLocaleLowerCase('tr-TR').includes(searchQueryNormalized);
        const authorMatches = book.author.toLocaleLowerCase('tr-TR').includes(searchQueryNormalized);

        const matchesQuery = !query || titleMatches || authorMatches;
        const matchesCategory = categories.length === 0 || book.categories.some(cat => categories.includes(cat));

        return matchesQuery && matchesCategory;
    });

    return new Response(JSON.stringify(books), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
