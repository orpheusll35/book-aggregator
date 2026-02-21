import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, ArrowRight, BookOpen } from "lucide-react";
import { currentUser } from "@/data/user";
import type { Book } from "@/types";
import BookCard from "./BookCard";

export default function SurpriseMe({ books }: { books: Book[] }) {
    const [suggestion, setSuggestion] = useState<Book | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const generateSuggestion = () => {
        setIsAnimating(true);

        // Logic:
        // 1. Filter books that match user interests
        // 2. Exclude books already in favorites
        // 3. Pick random

        // If no interests match, pick from highly rated books

        const favorites = currentUser.favoriteBookIds;

        let pool = books.filter(book =>
            // Matches at least one interest
            book.categories.some(cat => currentUser.interests.includes(cat)) &&
            // Not in favorites
            !favorites.includes(book.id)
        );

        if (pool.length === 0) {
            // Fallback: Top rated books not in favorites
            pool = books.filter(book => book.rating >= 4.5 && !favorites.includes(book.id));
        }

        setTimeout(() => {
            if (pool.length > 0) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                setSuggestion(pool[randomIndex]);
            }
            setIsAnimating(false);
        }, 800); // Fake delay for effect
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && !suggestion) {
            generateSuggestion();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default" // Using default (primary color)
                    size="lg"
                    className="w-full h-auto py-6 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-primary to-orange-600 border-none animate-pulse"
                >
                    <Sparkles className="mr-2 h-6 w-6 text-yellow-200" />
                    Beni Şaşırt!
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-serif text-primary">
                        <Sparkles className="h-6 w-6 text-yellow-500" />
                        Sizin İçin Seçtik
                    </DialogTitle>
                    <DialogDescription>
                        İlgi alanlarınıza ve okuma zevkinize göre özel bir öneri.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex justify-center min-h-[300px] items-center">
                    {isAnimating ? (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                            <p>Kitaplar taranıyor...</p>
                        </div>
                    ) : suggestion ? (
                        <div className="w-full max-w-sm transform transition-all duration-500 ease-out animate-in zoom-in-95 slide-in-from-bottom-2">
                            <BookCard book={suggestion} />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Öneri bulunamadı.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={generateSuggestion} disabled={isAnimating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isAnimating ? "animate-spin" : ""}`} />
                        Başka Bir Şey Öner
                    </Button>
                    {suggestion && (
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <a href={`/book/${suggestion.id}`}>
                                İncele <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
