'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { fa } from 'zod/locales';

const formSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema), 
        defaultValues: { email: '', password: ''},
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await api.post('/login', data);
            login(res.data.access_token);
            toast.success('Login berhasil!');
            router.push('/reports');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-2xl">
            <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Masuk</CardTitle>
            <CardDescription className="text-center">
            Masukkan email dan password
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register('email')} />
                    {form.formState.errors.email && (
                        <p className="text-sm textdestructive">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...form.register('password')} />
                    {form.formState.errors.password && (
                        <p className="text-sm textdestructive">{form.formState.errors.password.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                </Button>
                
                <Button onClick={() => router.push('/numeric')}>
                    Ke Decoder
                </Button>
            </form>
        </CardContent>
        </Card>
    );

}

