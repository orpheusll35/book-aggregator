import Container from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/SearchBar";
import TagPill from "@/components/ui/tag-pill";

export default function HeroSection() {
    const tags = [
        "Atomic Habits",
        "Psychology of Money",
        "Rich Dad Poor Dad",
        "1984",
        "Sapiens",
    ];

    return (
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
            <Container className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
                    <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                    Kitapları Keşfet
                </div>

                <h1 className="max-w-4xl text-5xl font-serif font-bold tracking-tight text-primary sm:text-6xl md:text-7xl mb-6">
                    Bir Sonraki Kitabınız İçin <br className="hidden md:block" />
                    <span className="text-accent">
                        En İyi Fiyatları Bulun
                    </span>
                </h1>

                <p className="max-w-2xl text-xl text-secondary mb-12 leading-relaxed">
                    Birden fazla kitabevindeki fiyatları karşılaştırın ve bir sonraki harika kitabınızı keşfedin.
                </p>

                <SearchBar />

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <span className="text-sm font-medium text-secondary mr-2 py-2">Popüler:</span>
                    {tags.map((tag) => (
                        <TagPill key={tag}>{tag}</TagPill>
                    ))}
                </div>
            </Container>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10" />
        </section>
    );
}
