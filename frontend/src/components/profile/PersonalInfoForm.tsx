import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveUserProfile } from "@/data/user";
import { useAuth } from "@/components/auth/AuthContext";
import { User, Mail, Calendar, Save, Loader2 } from "lucide-react";

export default function PersonalInfoForm() {
    const { user, profile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        birthDate: "",
        gender: "prefer-not-to-say",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.full_name || "",
                username: profile.username || "",
                email: user?.email || "",
                birthDate: profile.birth_date || "",
                gender: (profile as any).gender || "prefer-not-to-say",
            });
        }
    }, [profile, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        const { error } = await saveUserProfile({
            id: user.id,
            full_name: formData.name,
            username: formData.username,
            birth_date: formData.birthDate,
            interests: profile?.interests || [],
            favorite_book_ids: profile?.favorite_book_ids || [],
            favorite_vendor_ids: profile?.favorite_vendor_ids || []
        });

        if (error) {
            alert("Profil güncellenirken bir hata oluştu: " + error.message);
        } else {
            await refreshProfile();
            alert("Profil bilgileri güncellendi!");
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Kullanıcı Adı</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="pl-9"
                                required
                            />
                        </div>
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
                        <Label htmlFor="birthDate">Doğum Tarihi</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="pl-9"
                                required
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
