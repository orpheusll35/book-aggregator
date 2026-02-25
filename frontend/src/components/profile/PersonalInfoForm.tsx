import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUser, getUserProfile, saveUserProfile } from "@/data/user";
import { User, Mail, Calendar, Save } from "lucide-react";

export default function PersonalInfoForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(() => {
        const profile = getUserProfile();
        return {
            name: profile.name,
            email: profile.email,
            age: profile.age || "",
            gender: profile.gender || "prefer-not-to-say",
        };
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Persist
        const currentProfile = getUserProfile();
        saveUserProfile({
            ...currentProfile,
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender as any
        });

        setTimeout(() => {
            setIsLoading(false);
            alert("Profil bilgileri güncellendi!");
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">E-posta</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-9 bg-muted/50"
                            readOnly
                        />
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">E-posta adresi değiştirilemez.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="age">Yaş</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Cinsiyet</Label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                            <option value="other">Diğer</option>
                            <option value="prefer-not-to-say">Belirtmek İstemiyorum</option>
                        </select>
                    </div>
                </div>
            </div>

            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : <><Save className="mr-2 h-4 w-4" /> Değişiklikleri Kaydet</>}
            </Button>
        </form>
    );
}
