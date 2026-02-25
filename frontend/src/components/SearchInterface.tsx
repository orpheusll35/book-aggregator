import { useState, useMemo, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlidersHorizontal, Search } from "lucide-react";
import BookCard from "./BookCard";
import type { Book } from "@/types";

interface SearchInterfaceProps {
    initialQuery?: string;
    initialCategories?: string[];
}

const FilterContent = ({
    priceRange,
    setPriceRange,
    maxBookPrice,
    allCategories,
    selectedCategories,
    toggleCategory,
    resetFilters,
    categorySearchQuery,
    setCategorySearchQuery
}: {
    priceRange: number[];
    setPriceRange: (val: number[]) => void;
    maxBookPrice: number;
    allCategories: string[];
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    resetFilters: () => void;
    categorySearchQuery: string;
    setCategorySearchQuery: (val: string) => void;
}) => {
    const filteredCategories = allCategories.filter(cat =>
        cat.toLocaleLowerCase('tr-TR').includes(categorySearchQuery.trim().toLocaleLowerCase('tr-TR'))
    );

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Fiyat Aralığı ({priceRange[0]}₺ - {priceRange[1]}₺)
                </h3>
                <Slider
                    defaultValue={[0, maxBookPrice]}
                    max={maxBookPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-4"
                />
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none mb-3">Kategoriler</h3>

                <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Kategori ara..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="pl-8 h-9 text-sm"
                    />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                        {filteredCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Kategori bulunamadı</p>
                        ) : (
                            filteredCategories.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category}`}
                                        checked={selectedCategories.includes(category)}
                                        onCheckedChange={() => toggleCategory(category)}
                                    />
                                    <Label
                                        htmlFor={`category-${category}`}
                                        className="text-sm font-normal cursor-pointer text-ink"
                                    >
                                        {category}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
            >
                Filtreleri Temizle
            </Button>
        </div>
    );
};

export default function SearchInterface({ initialQuery = "", initialCategories = [] }: SearchInterfaceProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categorySearchQuery, setCategorySearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Dynamic data state
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Provide the external initial categories or fallback empty
    const allCategories = initialCategories.length > 0 ? initialCategories : [];

    const maxBookPrice = useMemo(() => {
        if (!books?.length) return 5000;
        const prices = books.map(book => {
            if (!book.vendors?.length) return 0;
            return Math.min(...book.vendors.map(v => v.price));
        });
        const max = Math.max(...prices);
        return max > 0 ? Math.ceil(max) : 5000;
    }, [books]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);
    }, []);

    // Perform the API search
    const performSearch = async (queryToSearch: string, categoriesToSearch: string[] = selectedCategories) => {
        setHasSearched(true);
        if (!queryToSearch.trim() && categoriesToSearch.length === 0) {
            setBooks([]);
            return;
        }
        setIsLoading(true);
        try {
            let apiUrl = `/api/search.json?q=${encodeURIComponent(queryToSearch)}`;
            if (categoriesToSearch.length > 0) {
                apiUrl += `&categories=${encodeURIComponent(categoriesToSearch.join(','))}`;
            }

            const res = await fetch(apiUrl);
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
            }
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-search if initialQuery exists
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const prices = book.vendors?.map((v) => v.price) || [0];
            const lowestPrice = Math.min(...prices);
            const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

            return matchesPrice;
        });
    }, [books, priceRange]);

    const toggleCategory = (category: string) => {
        const newSelected = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];

        setSelectedCategories(newSelected);

        // Only auto-search if a search has already been performed 
        // or if there is an active query
        if (hasSearched || searchQuery.trim()) {
            performSearch(searchQuery, newSelected);
        }
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, maxBookPrice]);
        setSearchQuery("");
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Mobile Filter Sheet */}
            <div className="md:hidden mb-4">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtreler
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <div className="mt-6">
                            <FilterContent
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                maxBookPrice={maxBookPrice}
                                allCategories={allCategories}
                                selectedCategories={selectedCategories}
                                toggleCategory={toggleCategory}
                                resetFilters={resetFilters}
                                categorySearchQuery={categorySearchQuery}
                                setCategorySearchQuery={setCategorySearchQuery}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                    <h2 className="text-lg font-serif font-bold mb-4 text-ink">Filtreler</h2>
                    <FilterContent
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        maxBookPrice={maxBookPrice}
                        allCategories={allCategories}
                        selectedCategories={selectedCategories}
                        toggleCategory={toggleCategory}
                        resetFilters={resetFilters}
                        categorySearchQuery={categorySearchQuery}
                        setCategorySearchQuery={setCategorySearchQuery}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="mb-8">
                    <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Kitaplarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-24 h-12 text-lg bg-white shadow-sm border-gray-200 focus:border-accent"
                        />
                        <Button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 h-10 px-6 bg-accent hover:bg-accent/90 text-white font-medium shadow-sm transition-all"
                        >
                            Ara
                        </Button>
                    </form>
                    {hasSearched && !isLoading && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {filteredBooks.length} sonuç gösteriliyor
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground animate-pulse">Aranıyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}

                {!hasSearched && books.length === 0 && (
                    <div className="text-center py-12 bg-paper rounded-lg border border-muted/50 mt-8">
                        <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-serif font-bold text-ink mb-2">Arama Yapın</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Veritabanımızdaki binlerce kitap arasında arama yapmak için yukarıdaki kutuyu kullanın. Arama yapana kadar sonuç gösterilmez.
                        </p>
                    </div>
                )}

                {hasSearched && !isLoading && filteredBooks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">Aradığınız kriterlere uygun kitap bulunamadı.</p>
                        <Button
                            variant="link"
                            onClick={resetFilters}
                            className="mt-2 text-accent"
                        >
                            Tüm filtreleri temizle
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
