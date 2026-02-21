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
    initialBooks: Book[];
}

const FilterContent = ({
    priceRange,
    setPriceRange,
    maxBookPrice,
    allCategories,
    selectedCategories,
    toggleCategory,
    resetFilters
}: {
    priceRange: number[];
    setPriceRange: (val: number[]) => void;
    maxBookPrice: number;
    allCategories: string[];
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    resetFilters: () => void;
}) => (
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
            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                    {allCategories.map((category) => (
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
                    ))}
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

export default function SearchInterface({ initialBooks }: SearchInterfaceProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            setSearchQuery(q);
        }
    }, []);

    const maxBookPrice = useMemo(() => {
        if (!initialBooks?.length) return 100;
        const prices = initialBooks.map(book => {
            if (!book.vendors?.length) return 0;
            return Math.min(...book.vendors.map(v => v.price));
        });
        const max = Math.max(...prices);
        return max > 0 ? Math.ceil(max) : 100;
    }, [initialBooks]);

    const [priceRange, setPriceRange] = useState([0, 2000]);

    useEffect(() => {
        setPriceRange([0, maxBookPrice]);
    }, [maxBookPrice]);

    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        initialBooks.forEach((book) => {
            if (book.categories) {
                book.categories.forEach((cat) => categories.add(cat));
            }
        });
        return Array.from(categories).sort();
    }, [initialBooks]);

    const filteredBooks = useMemo(() => {
        const query = searchQuery.trim().toLocaleLowerCase('tr-TR');

        return initialBooks.filter((book) => {
            const title = (book.title || "").toLocaleLowerCase('tr-TR');
            const author = (book.author || "").toLocaleLowerCase('tr-TR');

            const matchesSearch = query === "" ||
                title.includes(query) ||
                author.includes(query);

            const matchesCategory =
                selectedCategories.length === 0 ||
                (book.categories && book.categories.some((cat) => selectedCategories.includes(cat)));

            const prices = book.vendors?.map((v) => v.price) || [0];
            const lowestPrice = Math.min(...prices);
            const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [initialBooks, searchQuery, selectedCategories, priceRange]);

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
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
                    />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Kitaplarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-12 text-lg bg-white shadow-sm border-gray-200 focus:border-accent"
                        />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {filteredBooks.length} sonuç gösteriliyor
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">Aradığınız kriterlere uygun kitap bulunamadı.</p>
                        <Button
                            variant="link"
                            onClick={() => {
                                setSelectedCategories([]);
                                setPriceRange([0, maxBookPrice]);
                                setSearchQuery("");
                            }}
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
