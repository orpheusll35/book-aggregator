import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert("Giriş başarıyla yapıldı! (Demo)");
            window.location.href = "/";
        }, 1500);
    };

    return (
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-soft border border-border">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-serif text-ink tracking-tight">Hoş Geldiniz</h2>
                <p className="mt-2 text-sm text-secondary">
                    Hesabınıza giriş yapın.
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta Adresi</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ornek@email.com"
                                required
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Şifre</Label>
                            <a href="#" className="text-sm font-medium text-primary hover:text-primary/90 hover:underline">
                                Şifremi Unuttum?
                            </a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-base bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        "Giriş Yapılıyor..."
                    ) : (
                        <>
                            Giriş Yap <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Hesabınız yok mu? </span>
                <a href="/register" className="font-medium text-primary hover:text-primary/90 hover:underline">
                    Kayıt Ol
                </a>
            </div>
        </div>
    );
}
