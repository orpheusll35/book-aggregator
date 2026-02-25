import type { Book } from "../types";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    age?: number;
    gender?: "male" | "female" | "other" | "prefer-not-to-say";
    bio?: string;
    joinedDate: string;
    interests: string[];
    favoriteBookIds: string[];
    favoriteVendors: string[];
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        marketing: boolean;
    };
}

export const STORAGE_KEY = 'book_aggregator_user_profile';

const DEFAULT_USER: UserProfile = {
    id: "u123",
    name: "Remzi User",
    email: "remzi@example.com",
    age: 28,
    gender: "male",
    joinedDate: "2024-01-15",
    interests: ["Edebiyat", "Tarih", "Kişisel Gelişim"],
    favoriteBookIds: ["1", "4", "7"],
    favoriteVendors: ["Amazon TR", "D&R"],
    notificationPreferences: {
        email: true,
        sms: false,
        marketing: true,
    }
};

export const currentUser: UserProfile = DEFAULT_USER;

export const getUserProfile = (): UserProfile => {
    if (typeof window === 'undefined') return DEFAULT_USER;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_USER;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return DEFAULT_USER;
    }
};

export const saveUserProfile = (profile: UserProfile): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

// Helper to get full book objects for favorites
export const getFavoriteBooks = (allBooks: Book[], userId: string): Book[] => {
    // In a real app, we'd fetch based on userId. 
    // Here we just use the mock currentUser.
    return allBooks.filter(book => currentUser.favoriteBookIds.includes(book.id));
};
