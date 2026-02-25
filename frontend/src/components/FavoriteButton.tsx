import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { saveUserProfile } from "@/data/user";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    bookId: string;
    className?: string;
}

function FavoriteButtonContent({ bookId, className }: FavoriteButtonProps) {
    const { user, profile, refreshProfile } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (profile) {
            setIsFavorite(profile.favorite_book_ids?.includes(bookId) || false);
        }
    }, [profile, bookId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !profile) {
            alert("Favorilere eklemek için lütfen giriş yapın.");
            return;
        }

        const newFavorites = isFavorite
            ? profile.favorite_book_ids.filter((id: string) => id !== bookId)
            : [...(profile.favorite_book_ids || []), bookId];

        const { error } = await saveUserProfile({
            ...profile,
            favorite_book_ids: newFavorites
        });

        if (!error) {
            await refreshProfile();
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn(
                "rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white transition-all",
                isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500",
                className
            )}
        >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </Button>
    );
}

import { AuthProvider } from "@/components/auth/AuthContext";

export default function FavoriteButton(props: FavoriteButtonProps) {
    return (
        <AuthProvider>
            <FavoriteButtonContent {...props} />
        </AuthProvider>
    );
}
