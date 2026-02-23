import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-8">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-tight text-primary">
                                KitapBul
                                <span className="text-accent">.</span>
                            </span>
                        </a>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="/" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                                Anasayfa
                            </a>
                            <a href="/search" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                                Kitaplar
                            </a>
                            <a href="/deals" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                                Fırsatlar
                            </a>
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-secondary hover:text-primary">
                                <Search className="h-5 w-5" />
                            </Button>

                            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-accent font-medium" asChild>
                                <a href="/profile">
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline-block">Hesabım</span>
                                </a>
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="md:hidden text-secondary">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Container>
        </header>
    );
}
