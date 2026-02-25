import type { Book } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
            {/* Top Row: Store count & Best Price */}
            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-medium border-b border-border/40 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    {hasStock ? (
                        <>
                            <span className="text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                                {currency}{minPrice.toFixed(2)}
                            </span>

                            {/* Prominent Multi-Store Badge */}
                            {book.vendors.length > 1 ? (
                                <div className="flex items-center gap-1 text-primary-foreground bg-primary px-2 py-0.5 rounded-full font-bold shadow-sm">
                                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                    {book.vendors.length} Mağazada
                                </div>
                            ) : (
                                <span className="text-secondary opacity-80">
                                    {inStockVendors[0]?.name}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            Stokta Yok
                        </span>
                    )}
                </div>
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
