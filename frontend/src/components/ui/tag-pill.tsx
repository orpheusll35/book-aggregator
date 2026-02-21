import { cn } from "@/lib/utils";

interface TagPillProps extends React.HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    active?: boolean;
}

export default function TagPill({ className, children, active, ...props }: TagPillProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "bg-white border border-border text-secondary hover:border-accent hover:text-accent hover:shadow-sm",
                active && "bg-accent text-white border-accent hover:bg-accent/90 hover:text-white",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
