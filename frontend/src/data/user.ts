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

export const currentUser: UserProfile = {
    id: "u123",
    name: "Remzi User",
    email: "remzi@example.com",
    age: 28,
    gender: "male",
    joinedDate: "2024-01-15",
    interests: ["Edebiyat", "Tarih", "Kişisel Gelişim"],
    favoriteBookIds: ["1", "4", "7"], // Dealing with mock IDs from books.ts
    favoriteVendors: ["Amazon TR", "D&R"],
    notificationPreferences: {
        email: true,
        sms: false,
        marketing: true,
    }
};

// Helper to get full book objects for favorites
export const getFavoriteBooks = (allBooks: Book[], userId: string): Book[] => {
    // In a real app, we'd fetch based on userId. 
    // Here we just use the mock currentUser.
    return allBooks.filter(book => currentUser.favoriteBookIds.includes(book.id));
};
