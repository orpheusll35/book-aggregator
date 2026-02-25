import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { mapDbBookToBook, normalizeForSearch } from '@/lib/fetchBooks';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('q') || '').trim();
    const categoriesParam = url.searchParams.get('categories') || '';
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    if (!query && categories.length === 0) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Stage 1: Lightweight search for IDs only (no joins, very fast)
        let idQuery = supabase
            .from("books")
            .select('id');

        if (query) {
            const cleanQuery = query.replace(/[%_,()]/g, '');
            const wildcard = cleanQuery.replace(/[ıİiIğĞüÜşŞöÖçÇ]/g, '_');
            const orString = `title.ilike.%${cleanQuery}%,author.ilike.%${cleanQuery}%,title.ilike.%${wildcard}%,author.ilike.%${wildcard}%`;
            idQuery = idQuery.or(orString);
        }

        const { data: matchedIds, error: idError } = await idQuery
            .order('view_count', { ascending: false })
            .limit(2000);

        if (idError) {
            console.error("Search API Stage 1 Error:", idError.message);
            return new Response(JSON.stringify({ error: idError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ids = (matchedIds || []).map(m => m.id);

        if (ids.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Stage 2: Fetch full details only for matched IDs in chunks of 100
        // (Avoiding URL length limits/Bad Request)
        const allDbBooks: any[] = [];
        const chunkSize = 100;

        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunkIds = ids.slice(i, i + chunkSize);

            const { data: chunkBooks, error: detailError } = await supabase
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
                `)
                .in('id', chunkIds);

            if (detailError) {
                console.error("Search API Stage 2 Error:", detailError.message);
                return new Response(JSON.stringify({ error: detailError.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            if (chunkBooks) allDbBooks.push(...chunkBooks);
        }

        // Re-sort results to match the original ID order (view_count DESC)
        allDbBooks.sort((a, b) => {
            const indexA = ids.indexOf(a.id);
            const indexB = ids.indexOf(b.id);
            return indexA - indexB;
        });

        const normalizedQueryForJS = normalizeForSearch(query);
        const books = allDbBooks.map(mapDbBookToBook).filter(book => {
            const matchesCategory = categories.length === 0 || book.categories.some(cat => categories.includes(cat));
            if (!matchesCategory) return false;
            if (!query) return true;
            const normalizedTitle = normalizeForSearch(book.title);
            const normalizedAuthor = normalizeForSearch(book.author);
            return normalizedTitle.includes(normalizedQueryForJS) || normalizedAuthor.includes(normalizedQueryForJS);
        });

        return new Response(JSON.stringify(books), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error("Search API Crash:", e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
