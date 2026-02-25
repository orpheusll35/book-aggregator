import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { normalizeCategory } from '@/lib/fetchBooks';

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
        // Search in title or author
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
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

    const extractValidPrice = (str: string) => {
        if (!str) return 0;
        if (typeof str === 'number') return str;

        // Remove " TL", currency symbols, and spaces
        let clean = str.replace(/[^\d.,]/g, '').trim();
        if (!clean) return 0;

        // If it has both . and ,
        if (clean.includes('.') && clean.includes(',')) {
            if (clean.lastIndexOf('.') < clean.lastIndexOf(',')) {
                // Turkish style: 1.234,56
                clean = clean.replace(/\./g, '').replace(/,/g, '.');
            } else {
                // US style: 1,234.56
                clean = clean.replace(/,/g, '').replace(/\./g, '.');
            }
        } else if (clean.includes(',')) {
            // Only comma: 314,50 or 1,234
            // If comma is at index -3 or -2, it's decimal
            const commaIndex = clean.lastIndexOf(',');
            if (commaIndex >= clean.length - 3) {
                clean = clean.replace(/,/g, '.');
            } else {
                clean = clean.replace(/,/g, '');
            }
        } else if (clean.includes('.')) {
            // Only dot: 314.5 or 1.234
            // If dot is at index -3 or -2, it's decimal
            const dotIndex = clean.lastIndexOf('.');
            if (dotIndex >= clean.length - 3) {
                // Keep the dot as decimal
            } else {
                clean = clean.replace(/\./g, '');
            }
        }

        const val = parseFloat(clean);
        return isNaN(val) ? 0 : val;
    };

    const books = (dbBooks || []).map((b: any) => {
        let maxOriginalPrice = 0;
        const vendors = b.book_prices?.map((bp: any) => {
            const p = extractValidPrice(bp.price);
            if (bp.original_price) {
                const origP = extractValidPrice(bp.original_price);
                if (origP > maxOriginalPrice) maxOriginalPrice = origP;
            }
            return {
                name: bp.stores?.name || "Unknown Store",
                price: p,
                currency: "₺",
                url: bp.url || "#",
                inStock: bp.in_stock
            };
        }) || [];

        return {
            id: b.id,
            title: b.title,
            author: b.author || "Bilinmiyor",
            isbn: b.isbn || "N/A",
            coverImage: b.image_url || "/placeholder-book.jpg",
            description: "",
            categories: (b.categories && b.categories.length > 0
                ? Array.from(new Set(b.categories.map((cat: string) => normalizeCategory(cat))))
                : ["Genel"]) as string[],
            rating: 4.8,
            reviewCount: 42,
            originalPrice: maxOriginalPrice > 0 ? maxOriginalPrice : undefined,
            vendors
        };
    }).filter(book => {
        // Turkish-aware search filtering
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
