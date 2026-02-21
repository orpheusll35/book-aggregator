import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    href: string;
    variant?: "default" | "accent";
    className?: string;
}

export default function ActionCard({
    title,
    description,
    buttonText,
    href,
    variant = "default",
    className,
}: ActionCardProps) {
    const isAccent = variant === "accent";

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                isAccent ? "bg-accent text-white border-accent" : "bg-card text-primary border-border",
                className
            )}
        >
            <div className="relative z-10 flex flex-col items-start h-full">
                <h3 className={cn("text-2xl font-serif font-bold mb-2", isAccent ? "text-white" : "text-primary")}>
                    {title}
                </h3>
                <p className={cn("text-lg mb-8 flex-grow", isAccent ? "text-white/90" : "text-secondary")}>
                    {description}
                </p>
                <Button
                    asChild
                    className={cn(
                        "rounded-full px-8 h-12 text-base font-medium transition-transform group-hover:scale-105",
                        isAccent ? "bg-white text-accent hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90"
                    )}
                >
                    <a href={href}>
                        {buttonText} {isAccent && <ArrowRight className="ml-2 h-4 w-4" />}
                    </a>
                </Button>
            </div>
            {/* Decorative gradient blob */}
            <div
                className={cn(
                    "absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30",
                    isAccent ? "bg-white" : "bg-accent"
                )}
            />
        </div>
    );
}
