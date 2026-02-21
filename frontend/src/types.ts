export interface Vendor {
    name: string;
    price: number;
    currency: string;
    url: string;
    inStock: boolean;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverImage: string;
    description: string;
    categories: string[];
    rating: number;
    reviewCount: number;
    originalPrice?: number;
    vendors: Vendor[];
}
