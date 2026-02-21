import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Kitap adı, yazar veya ISBN ile arayın..."
                    className="w-full h-14 pl-12 pr-12 rounded-full border-border bg-white text-lg shadow-sm focus:border-accent focus:ring-accent transition-all hover:shadow-md"
                />
                <Button
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-accent text-white hover:bg-accent/90"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
