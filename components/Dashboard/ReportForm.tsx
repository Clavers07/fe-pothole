'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Item } from '@/types/item';
import { Report } from '@/types/report';
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
    
    jalan: z
    .string()
    .min(3, "Nama jalan minimal 3 karakter")
    .max(255),

    latitude: z
    .number()
    .min(-90, "Latitude tidak valid")
    .max(90, "Latitude tidak valid"),

    longitude: z
    .number()
    .min(-180, "Longitude tidak valid")
    .max(180, "Longitude tidak valid"),

    priority: z
    .enum(["low", "medium", "high"]),

    status: z
    .enum(["issued", "processed", "finished"]),

    label_id: z
    .number(),

    desc: z
    .string()
    .max(1000),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
    item?: Report | null;         // null = mode create
    onSuccess: () => void;      // refresh list setelah suskes
    onClose: () => void;        // tutup dialog
}

export default function ReportForm({ item, onSuccess, onClose }: ItemFormProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [labels, setLabels] = useState<Label[]>([])
    const [loading, setLoading] = useState(false);

    const handleGetLocation = () => {
    if (!navigator.geolocation) {
        toast.error("Browser tidak mendukung geolocation");
        return;
    }

    toast.loading("Mengambil lokasi...");

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            form.setValue('latitude', lat);
            form.setValue('longitude', lng);

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );

                const data = await res.json();

                const road =
                    data.address?.road ||
                    data.display_name ||
                    "Lokasi tidak diketahui";

                form.setValue('jalan', road);

            } catch (err) {
                console.error(err);
            }

            toast.dismiss();
            toast.success("Lokasi berhasil diambil");
        },
        () => {
            toast.dismiss();
            toast.error("Gagal mengambil lokasi");
        },
        { timeout: 8000 }
    );
};

    const fetchLabels = async () => {
        try {
            const res = await api.get('/labels')

            console.log("LABEL RESPONSE:", res.data)

            setLabels(res.data)
        } catch (err) {
            console.error(err)
            toast.error('Gagal memuat label')
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pic: undefined,
            jalan: '',
            latitude: 0,
            longitude: 0,
            priority: 'low',
            status: 'issued',
            label_id: undefined,
            desc: ''
        },
    });

    // Saat edit -> isis form + tampilkan preview gambar lama
    useEffect(() => {
        fetchLabels()

        if (item) {
            form.reset({
                pic: undefined, // file baru opsional ??
                jalan: item.jalan,
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                priority: item.priority as any,
                status: item.status as any,
                label_id: item.label_id ?? undefined,
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
        formData.append("jalan", values.jalan);
        formData.append("latitude", String(values.latitude));
        formData.append("longitude", String(values.longitude));
        formData.append("priority", values.priority);
        formData.append("status", values.status);
        formData.append("desc", values.desc);

        if (values.label_id) {
        formData.append("label_id", String(values.label_id));
        }

        if (values.pic instanceof File) {
            formData.append('pic', values.pic);
        }

        try {
            if (item?.id) {
                // UPDATE -> POST ke /items/{id} (sesuai route backend kamu)
                formData.append('_method', 'PUT')
                await api.post(`/reports/${item.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Item berhasil diupdate');
            } else {
                // CREATE
                await api.post('/reports', formData, {
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
            <div className='max-w-6xl w-full max-h-[70vh] overflow-y-auto'>
                <FormField
                control={form.control}
                name="jalan"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nama Jalan</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Jl. Yos Sudarso" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.00000001" {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            
            <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.00000001"  {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            />

                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                className="w-full"
            >
                📍 Gunakan Lokasi Saya
            </Button>

            <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                            <select
                                {...field}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                            <select
                                {...field}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="issued">issued</option>
                                <option value="processed">processed</option>
                                <option value="finished">finished</option>
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="label_id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Jenis Lubang</FormLabel>

                    <FormControl>
                        <select
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full border rounded-md p-2"
                        >
                        <option value="">Pilih kategori</option>

                        {labels.map((label) => (
                            <option key={label.id} value={label.id}>
                                {label.name}
                            </option>
                        ))}

                        </select>
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
                    Foto Laporan
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
            </div>

            

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
                    ? 'Update Report'
                    : 'Tambah Report'}
                </Button>

                </div>

            </form>
        </Form>
    );
}
