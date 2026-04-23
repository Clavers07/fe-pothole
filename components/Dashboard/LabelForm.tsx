'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
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
import { Label } from '@/types/label';

const formSchema = z.object({
    pic: z
        .any()
        .optional(),
    
    name: z
    .string()
    .min(3, "Nama label minimal 3 karakter")
    .max(255),

    desc: z
    .string()
    .max(1000),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
    item?: Label | null;         // null = mode create
    onSuccess: () => void;      // refresh list setelah suskes
    onClose: () => void;        // tutup dialog
}

export default function LabelForm({ item, onSuccess, onClose }: ItemFormProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [labels, setLabels] = useState<Label[]>([])
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pic: undefined,
            name: '',
            desc: ''
        },
    });

    // Saat edit -> isis form + tampilkan preview gambar lama
    useEffect(() => {
        // fetchLabels()

        if (item) {
            form.reset({
                pic: undefined, // file baru opsional ??
                name: item.name,
                desc: item.desc,
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
        formData.append("name", values.name);
        formData.append("desc", values.desc);

        if (values.pic instanceof File) {
            formData.append('pic', values.pic);
        }

        try {
            if (item?.id) {
                // UPDATE -> POST ke /items/{id} (sesuai route backend kamu)
                formData.append('_method', 'PUT')
                await api.post(`/labels/${item.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Item berhasil diupdate');
            } else {
                // CREATE
                await api.post('/labels', formData, {
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
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nama Label</FormLabel>
                    <FormControl>
                        <Input placeholder="Pothole" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Deskripsi laporan"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormItem>
                <FormLabel>
                    Foto Label
                </FormLabel>
                <FormControl>
                    <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
            

            {/* PREVIEW */}

            {preview && (

                <div className="mt-2">

                    <p className="text-sm text-muted-foreground mb-1">
                        Preview:
                    </p>

                    <div className="border rounded-md overflow-hidden w-40 h-40">

                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src ='/placeholder-image.jpg'
                        }}
                    />

                        </div>
                </div>
            )}

                {/* ACTION */}

                <div className="flex justify-end gap-3 pt-4">

                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Batal
                </Button>

                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                    ? 'Menyimpan...'
                    : item
                    ? 'Update Label'
                    : 'Tambah Label'}
                </Button>

                </div>

            </form>
        </Form>
    );
}
