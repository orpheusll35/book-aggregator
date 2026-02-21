import { BookOpen, Briefcase, FlaskConical, Globe, GraduationCap, Heart, History, Lightbulb, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
    name: string;
    count: string;
    icon?: string;
}

const iconMap: Record<string, any> = {
    "Fiction": BookOpen,
    "Non-fiction": Globe,
    "Philosophy": Lightbulb,
    "Psychology": User,
    "Business": Briefcase,
    "Self-development": GraduationCap,
    "Science": FlaskConical,
    "History": History,
    "Biography": User,
    "Technology": Globe,
    "Art": Heart,
};

export default function CategoryCard({ name, count }: CategoryCardProps) {
    const Icon = iconMap[name] || BookOpen;

    return (
        <a
            href={`/category/${name.toLowerCase().replace(/ /g, "-")}`}
            className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-border/50 transition-all duration-200 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 text-center h-full"
        >
            <div className="mb-2 h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-primary/70 transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-primary mb-0.5 group-hover:text-accent transition-colors line-clamp-1">
                {name}
            </h3>
            <span className="text-[10px] text-secondary font-medium">{count} books</span>
        </a>
    );
}
