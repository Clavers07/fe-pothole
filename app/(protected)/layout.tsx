'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, initializeAuth } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeAuth(); // Memulihkan state dari localStorage
        setLoading(false);
    }, [initializeAuth]);

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            router.replace('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}
