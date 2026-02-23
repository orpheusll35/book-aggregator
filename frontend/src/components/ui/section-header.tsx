import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    actionLink?: string;
    actionText?: string;
    className?: string;
}

export default function SectionHeader({
    title,
    subtitle,
    actionLink,
    actionText = "Tümünü Gör",
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}>
            <div className="space-y-1">
                <h2 className="text-3xl font-serif font-bold text-primary tracking-tight">{title}</h2>
                {subtitle && <p className="text-secondary text-lg max-w-2xl">{subtitle}</p>}
            </div>
            {actionLink && (
                <Button variant="ghost" className="group text-accent hover:text-accent/80 hover:bg-accent/5 px-0" asChild>
                    <a href={actionLink}>
                        {actionText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </Button>
            )}
        </div>
    );
}
