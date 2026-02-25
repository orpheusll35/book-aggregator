import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentUser, getUserProfile, saveUserProfile } from "@/data/user";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_INTERESTS = [
    "Edebiyat", "Çocuk & Gençlik", "Eğitim & Sınavlar", "Tarih",
    "Felsefe & Sosyoloji", "Psikoloji", "Kişisel Gelişim", "Din & Mitoloji",
    "Bilim & Teknoloji", "Politika & Siyaset", "Ekonomi & İş", "Sanat & Tasarım",
    "Yabancı Dil", "Yemek & Gastronomi", "Sağlık & Yaşam", "Çizgi Roman",
    "Akademik", "Genel"
];

export default function InterestSelector() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>(() => getUserProfile().interests);

    const toggleInterest = (interest: string) => {
        const newInterests = selectedInterests.includes(interest)
            ? selectedInterests.filter(i => i !== interest)
            : [...selectedInterests, interest];

        setSelectedInterests(newInterests);

        // Persist change
        const profile = getUserProfile();
        saveUserProfile({ ...profile, interests: newInterests });
    };

    return (
        <div className="space-y-6">
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

            <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => {
                    setSelectedInterests([]);
                    const profile = getUserProfile();
                    saveUserProfile({ ...profile, interests: [] });
                }}>
                    Tümünü Temizle
                </Button>
            </div>
        </div>
    );
}
