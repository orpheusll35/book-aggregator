import { supabase } from "./supabase";
import type { Book } from "@/types";

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

export const normalizeCategory = (cat: string): string => {
    if (!cat) return "Genel";

    const normalized = cat.trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('tr-TR');

    // Official Streamlined Categories
    const mapping: Record<string, string> = {
        // Edebiyat
        'roman': 'Edebiyat',
        'hikaye': 'Edebiyat',
        'öykü': 'Edebiyat',
        'şiir': 'Edebiyat',
        'klasik': 'Edebiyat',
        'edebiyat': 'Edebiyat',
        'tiyatro': 'Edebiyat',
        'senaryo': 'Edebiyat',
        'literary': 'Edebiyat',
        'literature': 'Edebiyat',

        // Çocuk & Gençlik
        'çocuk': 'Çocuk & Gençlik',
        'gençlik': 'Çocuk & Gençlik',
        'masal': 'Çocuk & Gençlik',
        'okul öncesi': 'Çocuk & Gençlik',
        'children': 'Çocuk & Gençlik',
        'teen': 'Çocuk & Gençlik',

        // Eğitim & Sınavlar
        'sınav': 'Eğitim & Sınavlar',
        'hazırlık': 'Eğitim & Sınavlar',
        'soru bankası': 'Eğitim & Sınavlar',
        'ders': 'Eğitim & Sınavlar',
        'eğitim': 'Eğitim & Sınavlar',
        'okul kitapları': 'Eğitim & Sınavlar',
        'exam': 'Eğitim & Sınavlar',

        // Tarih
        'tarih': 'Tarih',
        'history': 'Tarih',
        'araştırma-inceleme': 'Tarih',

        // Felsefe & Sosyoloji
        'felsefe': 'Felsefe & Sosyoloji',
        'sosyoloji': 'Felsefe & Sosyoloji',
        'philosophy': 'Felsefe & Sosyoloji',
        'sociology': 'Felsefe & Sosyoloji',

        // Psikoloji
        'psikoloji': 'Psikoloji',
        'psychology': 'Psikoloji',

        // Kişisel Gelişim
        'kişisel gelişim': 'Kişisel Gelişim',
        'self help': 'Kişisel Gelişim',
        'personal development': 'Kişisel Gelişim',

        // Din & Mitoloji
        'din': 'Din & Mitoloji',
        'islam': 'Din & Mitoloji',
        'tasavvuf': 'Din & Mitoloji',
        'mitoloji': 'Din & Mitoloji',
        'religion': 'Din & Mitoloji',

        // Bilim & Teknoloji
        'bilim': 'Bilim & Teknoloji',
        'teknoloji': 'Bilim & Teknoloji',
        'bilgisayar': 'Bilim & Teknoloji',
        'mühendislik': 'Bilim & Teknoloji',
        'science': 'Bilim & Teknoloji',
        'technology': 'Bilim & Teknoloji',

        // Politika & Siyaset
        'politika': 'Politika & Siyaset',
        'siyaset': 'Politika & Siyaset',
        'politics': 'Politika & Siyaset',

        // Ekonomi & İş
        'ekonomi': 'Ekonomi & İş',
        'iktisat': 'Ekonomi & İş',
        'işletme': 'Ekonomi & İş',
        'finans': 'Ekonomi & İş',
        'business': 'Ekonomi & İş',
        'economics': 'Ekonomi & İş',

        // Sanat & Tasarım
        'sanat': 'Sanat & Tasarım',
        'tasarım': 'Sanat & Tasarım',
        'müzik': 'Sanat & Tasarım',
        'sinema': 'Sanat & Tasarım',
        'mimari': 'Sanat & Tasarım',
        'art': 'Sanat & Tasarım',
        'music': 'Sanat & Tasarım',

        // Yabancı Dil
        'yabancı dil': 'Yabancı Dil',
        'ingilizce': 'Yabancı Dil',
        'language': 'Yabancı Dil',
        'almanca': 'Yabancı Dil',
        'fransızca': 'Yabancı Dil',

        // Yemek & Gastronomi
        'yemek': 'Yemek & Gastronomi',
        'gastronomi': 'Yemek & Gastronomi',
        'mutfak': 'Yemek & Gastronomi',
        'cooking': 'Yemek & Gastronomi',

        // Sağlık & Yaşam
        'sağlık': 'Sağlık & Yaşam',
        'spor': 'Sağlık & Yaşam',
        'lifestyle': 'Sağlık & Yaşam',
        'hobi': 'Sağlık & Yaşam',
        'aile': 'Sağlık & Yaşam',

        // Çizgi Roman
        'çizgi roman': 'Çizgi Roman',
        'manga': 'Çizgi Roman',
        'comics': 'Çizgi Roman',

        // Akademik
        'akademik': 'Akademik',
        'academic': 'Akademik',
        'başvuru': 'Akademik',
        'sözlük': 'Akademik'
    };

    // Sorted by length descending to match more specific terms first if needed
    // (though here we use .includes, so order matters slightly)
    const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        if (normalized.includes(key)) {
            return mapping[key];
        }
    }

    return "Genel";
};

/**
 * Decodes Unicode escape sequences (\uXXXX) and HTML entities (&entity; or &#123;).
 */
export function decodeText(str: string): string {
    if (!str) return str;

    let decoded = str;

    // 1. Handle Unicode Escapes (\uXXXX)
    decoded = decoded.replace(/\\u([\da-f]{4})/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

    // 2. Handle Numeric HTML Entities (&#1234;)
    decoded = decoded.replace(/&#(\d+);/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 10));
    });

    // 3. Handle Hex HTML Entities (&#xABCD;)
    decoded = decoded.replace(/&#x([\da-f]+);/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

    // 4. Handle Named HTML Entities (Comprehensive Turkish & common ones)
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>',
        '&apos;': "'",
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&rdquo;': '"',
        '&ldquo;': '"',
        '&ouml;': 'ö', '&Ouml;': 'Ö',
        '&ccedil;': 'ç', '&Ccedil;': 'Ç',
        '&uuml;': 'ü', '&Uuml;': 'Ü',
        '&igrave;': 'ì', '&Igrave;': 'Ì',
        '&ograve;': 'ò', '&Ograve;': 'Ò',
        '&ugrave;': 'ù', '&Ugrave;': 'Ù',
        '&agrave;': 'à', '&Agrave;': 'À',
        '&egrave;': 'è', '&Egrave;': 'È',
        '&nbsp': ' ',
        '&rsquo': "'",
        // Handle common double-encoding artifacts or missing semicolons
        '&ouml': 'ö', '&Ouml': 'Ö',
        '&ccedil': 'ç', '&Ccedil': 'Ç',
        '&uuml': 'ü', '&Uuml': 'Ü',
        '&Icirc;': 'İ', '&icirc;': 'i',
        '&THORN;': 'Ş', '&thorn;': 'ş',
        '&ETH;': 'Ğ', '&eth;': 'ğ',
        '&Yacute;': 'İ', '&yacute;': 'ı',
        '&scedil;': 'ş', '&Scedil;': 'Ş'
    };

    decoded = decoded.replace(/&[a-z0-9#]+;?/gi, (match) => {
        // Remove trailing semicolon if it exists for the lookup
        const lookup = match.endsWith(';') ? match : match;
        const result = entities[lookup] || entities[lookup + ';'] || match;
        return result;
    });

    // Special case for frequently seen Kitapyurdu/D&R patterns 
    // that might be incomplete entities
    decoded = decoded.replace(/&[oO]uml/g, (m) => m.toLowerCase().includes('o') ? (m[1] === 'O' ? 'Ö' : 'ö') : m)
        .replace(/&[cC]cedil/g, (m) => m[1] === 'C' ? 'Ç' : 'ç')
        .replace(/&[uU]uml/g, (m) => m[1] === 'U' ? 'Ü' : 'ü')
        .replace(/&[iI]circ/g, (m) => m[1] === 'I' ? 'İ' : 'i')
        .replace(/&[sS]cedil/g, (m) => m[1] === 'S' ? 'Ş' : 'ş')
        .replace(/&[gG]breve/g, (m) => m[1] === 'G' ? 'Ğ' : 'ğ');

    return decoded.trim();
}

/**
 * Normalizes text for search by:
 * 1. Lowercasing with Turkish locale
 * 2. Replacing Turkish specific chars with ASCII equivalents
 * 3. Removing extra spaces
 */
export function normalizeForSearch(str: string): string {
    if (!str) return "";
    return str
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, ' ')
        .trim();
}

export function mapDbBookToBook(b: any): Book {
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

    const rawCategories = (b.categories && b.categories.length > 0) ? b.categories : ["Genel"];
    const normalizedCategories = Array.from(new Set(rawCategories.map((c: string) => normalizeCategory(c)))) as string[];

    return {
        id: b.id,
        title: decodeText(b.title),
        author: decodeText(b.author || "Bilinmiyor"),
        isbn: b.isbn || "N/A",
        coverImage: b.image_url || "/placeholder-book.jpg",
        description: "",
        categories: normalizedCategories,
        rating: 4.8,
        reviewCount: 42,
        originalPrice: maxOriginalPrice > 0 ? maxOriginalPrice : undefined,
        vendors
    };
}

/**
 * Fetches featured books that are IN STOCK.
 * Sorted by popularity (view_count).
 */
export async function fetchFeaturedBooks(limit: number = 30): Promise<Book[]> {
    console.log(`fetchFeaturedBooks: fetching popular book IDs...`);

    // 1. Fetch IDs ordered by view_count (uses index)
    const { data: popularBooks, error: popError } = await supabase
        .from('books')
        .select('id')
        .order('view_count', { ascending: false })
        .limit(limit * 3); // Fetch more to allow for out-of-stock filtering

    if (popError) {
        console.error("Error fetching popular book IDs:", popError.message);
        return [];
    }

    const popularIds = popularBooks.map(b => b.id);

    // 2. Fetch ALL prices for these IDs (including out of stock)
    const { data: dbPrices, error } = await supabase
        .from("book_prices")
        .select(`
            price,
            original_price,
            url,
            in_stock,
            stores (name),
            books!inner(*)
        `)
        .in('book_id', popularIds);

    if (error) {
        console.error("Error fetching featured books:", error.message);
        return [];
    }

    // Grouping by ISBN to ensure distinct books if they appear in multiple stores
    const bookMap = new Map<string, any>();
    for (const bp of dbPrices || []) {
        const bookData = bp.books as any;
        const isbn = bookData.isbn;
        if (!bookMap.has(isbn)) {
            bookMap.set(isbn, { ...bookData, book_prices: [] });
        }
        bookMap.get(isbn).book_prices.push({
            price: bp.price,
            original_price: bp.original_price,
            url: bp.url,
            in_stock: bp.in_stock,
            stores: bp.stores
        });
    }

    return Array.from(bookMap.values())
        .map(mapDbBookToBook)
        .filter(book => book.vendors.some(v => v.inStock))
        .slice(0, limit);
}

/**
 * Fetches new arrivals that are IN STOCK.
 */
export async function fetchNewArrivals(limit: number = 30): Promise<Book[]> {
    console.log(`fetchNewArrivals: fetching latest unique books from prices...`);

    // 1. Get the latest price entries that have valid prices
    // We order by updated_at (which exists on book_prices)
    const { data: latestPriceEntries, error: idError } = await supabase
        .from("book_prices")
        .select("book_id")
        .neq('price', '')
        .order('updated_at', { ascending: false })
        .limit(limit * 8); // Look back further to ensure we have variety

    if (idError || !latestPriceEntries) {
        console.error("Error fetching latest price IDs:", idError?.message);
        return [];
    }

    // Get unique IDs in the order they were found
    const uniqueIds = Array.from(new Set(latestPriceEntries.map(p => p.book_id))).slice(0, limit + 20);

    if (uniqueIds.length === 0) return [];

    // 2. Fetch ALL price versions for these specific IDs
    const { data: dbPrices, error } = await supabase
        .from("book_prices")
        .select(`
            price,
            original_price,
            url,
            in_stock,
            stores (name),
            books!inner(*)
        `)
        .in('book_id', uniqueIds);

    if (error) {
        console.error("Error fetching new arrivals:", error.message);
        return [];
    }

    const bookMap = new Map<string, any>();
    for (const bp of dbPrices || []) {
        const bookData = bp.books as any;
        const isbn = bookData.isbn;
        if (!bookMap.has(isbn)) {
            bookMap.set(isbn, { ...bookData, book_prices: [] });
        }
        bookMap.get(isbn).book_prices.push({
            price: bp.price,
            original_price: bp.original_price,
            url: bp.url,
            in_stock: bp.in_stock,
            stores: bp.stores
        });
    }

    const result = Array.from(bookMap.values()).map(mapDbBookToBook);

    // Ensure the final list follows the original uniqueIds order (latest first)
    // AND filter for in-stock only
    return result
        .sort((a, b) => uniqueIds.indexOf(a.id) - uniqueIds.indexOf(b.id))
        .filter(book => book.vendors.some(v => v.inStock))
        .slice(0, limit);
}

/**
 * Fetches a list of books with their prices.
 * Optimization: Now uses a more targeted selection.
 */
export async function fetchBooks(limit: number = 300): Promise<Book[]> {
    console.log(`fetchBooks: querying supabase (limit ${limit})...`);

    const { data: dbBooks, error } = await supabase
        .from("books")
        .select(`
            *,
            book_prices (
                price,
                original_price,
                url,
                in_stock,
                stores (name)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching books from Supabase:", error.message);
        return [];
    }

    return (dbBooks || []).map(mapDbBookToBook);
}

/**
 * Fetches a diverse pool of in-stock books for the Surprise Me feature.
 */
export async function fetchBooksForSurpriseMe(limit: number = 200): Promise<Book[]> {
    console.log(`fetchBooksForSurpriseMe: fetching in-stock books...`);

    // We look for books that have at least one in-stock price
    // and sort by updated_at on prices to get active items
    const { data: dbPrices, error } = await supabase
        .from("book_prices")
        .select(`
            price,
            original_price,
            url,
            in_stock,
            stores (name),
            books!inner(*)
        `)
        .eq('in_stock', true)
        .neq('price', '')
        .order('updated_at', { ascending: false })
        .limit(limit * 2);

    if (error || !dbPrices) {
        console.error("Error fetching books for Surprise Me:", error?.message);
        return [];
    }

    const bookMap = new Map<string, any>();
    for (const bp of dbPrices) {
        const bookData = bp.books as any;
        const isbn = bookData.isbn;
        if (!bookMap.has(isbn)) {
            bookMap.set(isbn, { ...bookData, book_prices: [] });
        }
        bookMap.get(isbn).book_prices.push({
            price: bp.price,
            original_price: bp.original_price,
            url: bp.url,
            in_stock: bp.in_stock,
            stores: bp.stores
        });
    }

    return Array.from(bookMap.values())
        .map(mapDbBookToBook)
        .slice(0, limit);
}

/**
 * Fetches 100 random deals from the latest 1000 books.
 */
export async function fetchDeals(limit: number = 100): Promise<Book[]> {
    console.log(`fetchDeals: querying book_prices for latest deals...`);

    // 1. Fetch latest price records that have an original_price and are in stock
    const { data: dbPrices, error } = await supabase
        .from("book_prices")
        .select(`
            price,
            original_price,
            url,
            in_stock,
            stores (name),
            books!inner(*)
        `)
        .eq('in_stock', true)
        .neq('price', '')
        .neq('original_price', '')
        .order('updated_at', { ascending: false })
        .limit(1000); // Pool size to select random from

    if (error || !dbPrices) {
        console.error("Error fetching deals from book_prices:", error?.message);
        return [];
    }

    // 2. Map and filter for actual discounts (original_price > price)
    const bookMap = new Map<string, any>();
    for (const bp of dbPrices) {
        const p = extractValidPrice(bp.price);
        const op = extractValidPrice(bp.original_price);

        if (op > p) {
            const bookData = bp.books as any;
            const isbn = bookData.isbn;
            if (!bookMap.has(isbn)) {
                bookMap.set(isbn, { ...bookData, book_prices: [] });
            }
            bookMap.get(isbn).book_prices.push({
                price: bp.price,
                original_price: bp.original_price,
                url: bp.url,
                in_stock: bp.in_stock,
                stores: bp.stores
            });
        }
    }

    // 3. Convert to Book type, shuffle, and return limit
    return Array.from(bookMap.values())
        .map(mapDbBookToBook)
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
}

/**
 * Lightweight fetch for category derivation.
 * Gets only the 'categories' field from a larger sample of recent books.
 */
export async function fetchBooksForCategories(sampleSize: number = 500): Promise<string[][]> {
    console.log(`fetchBooksForCategories: sampling ${sampleSize} books...`);

    const { data, error } = await supabase
        .from('books')
        .select('categories')
        .order('created_at', { ascending: false })
        .limit(sampleSize);

    if (error) {
        console.error("Error fetching categories:", error.message);
        return [];
    }

    return (data || []).map(b => (b.categories || []).map(normalizeCategory));
}

export async function fetchBookById(id: string): Promise<Book | null> {
    const { data: b, error } = await supabase
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
        .eq("id", id)
        .single();

    if (error || !b) {
        console.error(`Error fetching book ${id}:`, error?.message);
        return null;
    }

    return mapDbBookToBook(b);
}
