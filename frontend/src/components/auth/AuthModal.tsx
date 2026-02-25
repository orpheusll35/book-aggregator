import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuthForms } from "./AuthForms";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">KitapBul'a Hoş Geldiniz</DialogTitle>
                    <DialogDescription className="text-center">
                        Favori kitaplarınızı takip etmek ve size özel öneriler almak için giriş yapın.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <AuthForms />
                </div>
            </DialogContent>
        </Dialog>
    );
}
