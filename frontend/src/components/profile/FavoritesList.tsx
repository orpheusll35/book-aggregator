import { currentUser, getFavoriteBooks } from "@/data/user";
import BookCard from "@/components/BookCard";
import { Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";

export default function FavoritesList({ books }: { books: Book[] }) {
    const favoriteBooks = getFavoriteBooks(books, currentUser.id);

    return (
        <div className="space-y-8">
            {/* Favorite Books */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    Favori Kitaplarım <span className="text-sm font-normal text-muted-foreground">({favoriteBooks.length})</span>
                </h3>
                {favoriteBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteBooks.map(book => (
                            <div key={book.id} className="relative group">
                                <BookCard book={book} />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shadow-md"
                                    title="Favorilerden Kaldır"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Henüz favori kitap eklemediniz.</p>
                )}
            </div>

            {/* Favorite Vendors */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    Favori Kitapçılarım
                </h3>
                <div className="flex flex-wrap gap-4">
                    {currentUser.favoriteVendors.map(vendor => (
                        <div key={vendor} className="flex items-center gap-3 p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <Store className="h-5 w-5" />
                            </div>
                            <span className="font-medium">{vendor}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
