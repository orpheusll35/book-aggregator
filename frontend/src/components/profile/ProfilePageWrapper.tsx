import { useState } from "react";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "./PersonalInfoForm";
import FavoritesList from "./FavoritesList";
import InterestSelector from "./InterestSelector";
import { User, Heart, Star, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";
import type { Book } from "@/types";

type Tab = "personal" | "favorites" | "interests";

function ProfilePageContent({ books }: { books: Book[] }) {
    const { user, profile, loading, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("personal");

    const tabs = [
        { id: "personal", label: "Kişisel Bilgiler", icon: User },
        { id: "favorites", label: "Favorilerim", icon: Heart },
        { id: "interests", label: "İlgi Alanlarım", icon: Star },
    ];

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Giriş Yapılmadı</h2>
                <p className="text-muted-foreground">Profilinizi görüntülemek için lütfen giriş yapın.</p>
            </div>
        );
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0].toUpperCase() || "??";

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 space-y-4">
                <div className="p-6 bg-white rounded-2xl border shadow-sm text-center">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4">
                        {initials}
                    </div>
                    <h2 className="font-serif font-bold text-xl text-ink truncate px-2">
                        {profile?.full_name || "Yeni Kullanıcı"}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate px-2">{user?.email}</p>
                </div>

                <nav className="flex flex-col gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted text-muted-foreground hover:text-ink"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-4 w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-2xl border shadow-sm p-6 min-h-[500px]">
                <h2 className="text-2xl font-serif font-bold text-ink mb-6 pb-4 border-b">
                    {tabs.find(t => t.id === activeTab)?.label}
                </h2>

                {activeTab === "personal" && <PersonalInfoForm />}
                {activeTab === "favorites" && <FavoritesList books={books} />}
                {activeTab === "interests" && <InterestSelector />}
            </div>
        </div>
    );
}

import { AuthProvider } from "@/components/auth/AuthContext";

export default function ProfilePageWrapper({ books }: { books: Book[] }) {
    return (
        <AuthProvider>
            <ProfilePageContent books={books} />
        </AuthProvider>
    );
}
