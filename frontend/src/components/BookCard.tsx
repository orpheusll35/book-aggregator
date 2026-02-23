import type { Book } from "@/types";
import { Card } from "@/components/ui/card";

interface BookCardProps {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    const inStockVendors = book.vendors.filter(v => v.inStock);
    const hasStock = inStockVendors.length > 0;
    const currency = book.vendors[0]?.currency || "₺";
    const minPrice = hasStock ? Math.min(...inStockVendors.map((v) => v.price)) : 0;

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
            {/* Top Row: Store & Price */}
            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-medium text-secondary border-b border-border/40">
                <div className="flex items-center gap-1.5">
                    {hasStock ? (
                        <>
                            <span className="text-accent font-bold bg-accent/5 px-2 py-0.5 rounded-full">
                                {currency}{minPrice.toFixed(2)}
                            </span>
                            {book.originalPrice && book.originalPrice > minPrice && (
                                <span className="text-muted-foreground line-through decoration-red-400/50">
                                    {currency}{book.originalPrice.toFixed(2)}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                            Stokta Yok
                        </span>
                    )}
                </div>
                {hasStock && book.originalPrice && book.originalPrice > minPrice && (
                    <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-sm">
                        -%{Math.round(((book.originalPrice - minPrice) / book.originalPrice) * 100)}
                    </span>
                )}
            </div>

            {/* Image Area: Contained & Padded */}
            <div className="relative aspect-[3/4] w-full p-4 bg-transparent flex items-center justify-center">
                <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            </div>

            {/* Bottom Area: Info */}
            <div className="flex flex-col flex-grow px-3 pb-3 space-y-1">
                <h3 className="font-sans font-medium text-sm text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                    {book.title}
                </h3>
                <p className="text-xs text-secondary line-clamp-1">{book.author}</p>
            </div>

            {/* Invisible Link */}
            <a href={`/book/${book.id}`} className="absolute inset-0 z-10" aria-label={`Kitabı incele: ${book.title}`}></a>
        </Card>
    );
}
