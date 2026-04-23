import { Button } from '@/components/ui/button';
import { LogOut, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function Sidebar() {
    const { logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch {}
        logout();
        router.push('/login');
    };

    return (
        <aside className="w-64 border-r bg-card min-h-screen p-4 flex flex-col">
            <div className='flex items-center justify-start gap-2 mb-8 px-2'>
                <Package className='h-6 w-6' />
                <h2 className="text-xl font-semibold">Reports Manager</h2>
            </div>

            <nav className="flex-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/reports">Semua Laporan</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/labels">Semua Label</a>
                </Button>
            </nav>

            <Button variant="ghost" className='justify-start text-destructive'
            onClick={handleLogout}>
                <LogOut className='mr-2 h-4 w-4' />
                Logout
            </Button>
        </aside>
    );
}