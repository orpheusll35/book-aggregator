import { supabase } from "./supabase";
import type { Book } from "@/types";

export async function fetchBooks(): Promise<Book[]> {
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
        console.error("Error fetching books from Supabase:", error.message);
        return [];
    }

    return (dbBooks || []).map((b: any) => {
        let maxOriginalPrice = 0;

        const vendors = b.book_prices?.map((bp: any) => {
            // Convert string prices like "60,00 TL" -> 60.00
            const priceStr = bp.price ? bp.price.replace(',', '.') : "0";
            const priceMatch = priceStr.match(/[\d.]+/);
            const p = priceMatch ? parseFloat(priceMatch[0]) : 0;

            if (bp.original_price) {
                const origStr = bp.original_price.replace(',', '.');
                const origMatch = origStr.match(/[\d.]+/);
                const origP = origMatch ? parseFloat(origMatch[0]) : 0;
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
            categories: b.categories && b.categories.length > 0 ? b.categories : ["Genel"],
            rating: 4.8,
            reviewCount: 42,
            originalPrice: maxOriginalPrice > 0 ? maxOriginalPrice : undefined,
            vendors
        };
    });
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

    let maxOriginalPrice = 0;
    const vendors = b.book_prices?.map((bp: any) => {
        const priceStr = bp.price ? bp.price.replace(',', '.') : "0";
        const priceMatch = priceStr.match(/[\d.]+/);
        const p = priceMatch ? parseFloat(priceMatch[0]) : 0;

        if (bp.original_price) {
            const origStr = bp.original_price.replace(',', '.');
            const origMatch = origStr.match(/[\d.]+/);
            const origP = origMatch ? parseFloat(origMatch[0]) : 0;
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
        categories: b.categories && b.categories.length > 0 ? b.categories : ["Genel"],
        rating: 4.8,
        reviewCount: 42,
        originalPrice: maxOriginalPrice > 0 ? maxOriginalPrice : undefined,
        vendors
    };
}
