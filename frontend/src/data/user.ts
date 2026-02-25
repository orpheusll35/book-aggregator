import { supabase } from "@/lib/supabase";
import type { Book } from "@/types";

export interface UserProfile {
    id: string;
    full_name: string;
    username?: string;
    birth_date?: string;
    avatar_url?: string;
    interests: string[];
    favorite_book_ids: string[];
    favorite_vendor_ids: string[];
}

export async function saveUserProfile(profile: any): Promise<{ error: any }> {
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: profile.id,
            full_name: profile.full_name || profile.name,
            username: profile.username,
            birth_date: profile.birth_date || profile.birthDate,
            interests: profile.interests,
            favorite_book_ids: profile.favorite_book_ids || profile.favoriteBookIds,
            favorite_vendor_ids: profile.favorite_vendor_ids || profile.favoriteVendorIds,
            updated_at: new Date().toISOString()
        });
    return { error };
}

export function getFavoriteBooks(books: Book[], favoriteBookIds: string[]): Book[] {
    if (!favoriteBookIds) return [];
    return books.filter(book => favoriteBookIds.includes(book.id));
}
