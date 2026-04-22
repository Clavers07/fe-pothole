'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const formSchema = z.object({
    nama: z.string().min(1, 'Nama wajib diisi'),
    tahun: z.string().min(1, 'Tahun wahib diisi').regex(/^\d{4}$/, 'Tahun harus 4 digit',),
    pic: z.any().optional(), // file atau null
});



type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
    item?: Item | null;         // null = mode create
    onSuccess: () => void;      // refresh list setelah suskes
    onClose: () => void;        // tutup dialog
}

export default function ItemForm({ item, onSuccess, onClose }: ItemFormProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            tahun: '',
            pic: undefined,
        },
    });

    // Saat edit -> isi form + tampilkan preview gambar lama
    useEffect(() => {
        if (item) {
            form.reset({
                nama: item.nama,
                tahun: item.tahun.toString(),
                pic: undefined, // file baru opsional ??
            });
            setPreview(`http://localhost:8000/${item.pic}`); // sesuaikan base URL
        } else {
            form.reset();
            setPreview(null);
        }
    }, [item, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            form.setValue('pic', file);
        } 
    };

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('nama', values.nama);
        formData.append('tahun', values.tahun);

        if (values.pic instanceof File) {
            formData.append('pic', values.pic);
        }

        try {
            if (item?.id) {
                // UPDATE -> POST ke /items/{id} (sesuai route backend kamu)
                formData.append("_method", "PUT");
                await api.post(`/items/${item.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Item berhasil diupdate');
            } else {
                // CREATE
                await api.post('/items', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Item berhasil ditambahkan');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nama Item</FormLabel>
                    <FormControl>
                        <Input placeholder="Masukkan nama item" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="tahun"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tahun</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Contoh: 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormItem>
                <FormLabel>Gambar {item ? '(kosongkan jika tidak ingin ganti)' : '(wajib)'}</FormLabel>
                <FormControl>
                    <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            {/* Preview */}
            {preview && (
                <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                    <div className="border rounded-md overflow-hidden w-40 h-40">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg'; // fallback jika error
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Batal
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : item ? 'Update Item' : 'Tambah Item'}
                </Button>
            </div>
            </form>
        </Form>
    );
}
