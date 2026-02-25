import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveUserProfile } from "@/data/user";
import { useAuth } from "@/components/auth/AuthContext";
import { Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_STORES = [
    "D&R", "Kitapyurdu", "BKM Kitap", "Kırmızı Kedi", "Amazon TR", "Hepsiburada"
];

const AVAILABLE_INTERESTS = [
    "Edebiyat", "Çocuk & Gençlik", "Eğitim & Sınavlar", "Tarih",
    "Felsefe & Sosyoloji", "Psikoloji", "Kişisel Gelişim", "Din & Mitoloji",
    "Bilim & Teknoloji", "Politika & Siyaset", "Ekonomi & İş", "Sanat & Tasarım",
    "Yabancı Dil", "Yemek & Gastronomi", "Sağlık & Yaşam", "Çizgi Roman",
    "Akademik", "Genel"
];

export default function InterestSelector() {
    const { user, profile, refreshProfile } = useAuth();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);

    useEffect(() => {
        if (profile) {
            setSelectedInterests(profile.interests || []);
            setSelectedStores(profile.favorite_vendor_ids || []);
        }
    }, [profile]);

    const toggleInterest = async (interest: string) => {
        if (!user || !profile) return;
        const newInterests = selectedInterests.includes(interest)
            ? selectedInterests.filter(i => i !== interest)
            : [...selectedInterests, interest];

        const { error } = await saveUserProfile({ ...profile, interests: newInterests });
        if (!error) await refreshProfile();
    };

    const toggleStore = async (store: string) => {
        if (!user || !profile) return;
        const newStores = selectedStores.includes(store)
            ? selectedStores.filter(s => s !== store)
            : [...selectedStores, store];

        const { error } = await saveUserProfile({ ...profile, favorite_vendor_ids: newStores });
        if (!error) await refreshProfile();
    };

    return (
        <div className="space-y-10">
            <section className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-1">İlgi Alanlarınız</h3>
                    <p className="text-sm text-muted-foreground">Size en uygun kitapları önerebilmemiz için beğendiğiniz türleri seçin.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map(interest => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                            <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    isSelected
                                        ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                                        : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                            >
                                {isSelected ? <Check className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                                {interest}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-6 pt-6 border-t">
                <div>
                    <h3 className="text-lg font-medium mb-1">Favori Mağazalarınız</h3>
                    <p className="text-sm text-muted-foreground">Sıklıkla tercih ettiğiniz kitap satış noktalarını işaretleyin.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_STORES.map(store => {
                        const isSelected = selectedStores.includes(store);
                        return (
                            <button
                                key={store}
                                onClick={() => toggleStore(store)}
                                className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    isSelected
                                        ? "border-transparent bg-accent text-white hover:bg-accent/80"
                                        : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                            >
                                {isSelected ? <Check className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                                {store}
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="pt-4 border-t">
                <Button variant="outline" onClick={async () => {
                    if (!user || !profile) return;
                    const { error } = await saveUserProfile({ ...profile, interests: [], favorite_vendor_ids: [] });
                    if (!error) await refreshProfile();
                }}>
                    Tümünü Temizle
                </Button>
            </div>
        </div>
    );
}
