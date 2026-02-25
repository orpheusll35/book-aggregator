import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { mapDbBookToBook, normalizeForSearch } from '@/lib/fetchBooks';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const categoriesParam = url.searchParams.get('categories') || '';
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    if (!query && categories.length === 0) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
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
        // Create a wildcard pattern to bypass Turkish collation issues (i vs İ)
        // We replace Turkish-sensitive chars with '_' which matches any single character
        const wildcardPattern = query.replace(/[iİıIçÇşŞğĞüÜöÖ]/g, '_');

        // Search in title or author using both original and wildcard pattern
        // This ensures we catch the record even if collation fails
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,title.ilike.%${wildcardPattern}%,author.ilike.%${wildcardPattern}%`)
            .order('view_count', { ascending: false })
            .order('id', { ascending: true });
    } else {
        supabaseQuery = supabaseQuery.order('view_count', { ascending: false })
            .order('id', { ascending: true });
    }

    // We don't filter by categories in the supabaseQuery anymore, 
    // because its raw categories vs our simplified categories.
    // We will filter in-memory from the result set.

    // Increase limit to 2000 for broader coverage while maintaining performance
    const { data: dbBooks, error } = await supabaseQuery.limit(2000);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const books = (dbBooks || []).map(mapDbBookToBook).filter(book => {
        // Final precise filter in JS using extreme normalization
        const normalizedQuery = normalizeForSearch(query);
        const normalizedTitle = normalizeForSearch(book.title);
        const normalizedAuthor = normalizeForSearch(book.author);

        const titleMatches = normalizedTitle.includes(normalizedQuery);
        const authorMatches = normalizedAuthor.includes(normalizedQuery);

        const matchesQuery = !query || titleMatches || authorMatches;
        const matchesCategory = categories.length === 0 || book.categories.some(cat => categories.includes(cat));

        return matchesQuery && matchesCategory;
    });

    return new Response(JSON.stringify(books), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
