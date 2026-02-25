import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Github, Chrome, Phone, ArrowRight, Loader2 } from 'lucide-react';

export function AuthForms() {
    const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'otp'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                if (password !== confirmPassword) {
                    throw new Error('Şifreler eşleşmiyor.');
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            username: username,
                            birth_date: birthDate
                        }
                    }
                });
                if (error) throw error;

                if (data.session) {
                    setMessage('Kayıt başarılı! Giriş yapılıyor...');
                } else {
                    setMessage('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: phoneNumber,
            });
            if (error) throw error;
            setMode('otp');
            setMessage('Doğrulama kodu gönderildi.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: phoneNumber,
                token: otp,
                type: 'sms'
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-sm mx-auto">
            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                    {message}
                </div>
            )}

            {(mode === 'login' || mode === 'register') && (
                <>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Ad Soyad</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Ahmet Yılmaz"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Kullanıcı Adı</Label>
                                    <Input
                                        id="username"
                                        placeholder="ahmet123"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Veya şununla devam et</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={loading}>
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline" type="button" onClick={() => setMode('phone')} disabled={loading}>
                            <Phone className="mr-2 h-4 w-4" />
                            Telefon
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {mode === 'login' ? (
                            <>
                                Hesabınız yok mu?{' '}
                                <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">
                                    Kayıt Ol
                                </button>
                            </>
                        ) : (
                            <>
                                Zaten hesabınız var mı?{' '}
                                <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                                    Giriş Yap
                                </button>
                            </>
                        )}
                    </p>
                </>
            )}

            {mode === 'phone' && (
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+905..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">Numaranızı +90 ile başlayan formatta giriniz.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Kod Gönder
                    </Button>
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="w-full text-center text-sm text-muted-foreground hover:text-primary pt-2"
                    >
                        Geri Dön
                    </button>
                </form>
            )}

            {mode === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Doğrulama Kodu</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="6 haneli kod"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Doğrula ve Giriş Yap
                    </Button>
                    <button
                        type="button"
                        onClick={() => setMode('phone')}
                        className="w-full text-center text-sm text-muted-foreground hover:text-primary pt-2"
                    >
                        Numarayı Düzenle
                    </button>
                </form>
            )}
        </div>
    );
}
