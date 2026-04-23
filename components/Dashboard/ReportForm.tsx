'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/types/label';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const formSchema = z.object({
    pic: z.any().optional(),
    jalan: z.string().min(3, 'Nama jalan minimal 3 karakter').max(255),
    latitude: z.number().min(-90, 'Latitude tidak valid').max(90, 'Latitude tidak valid'),
    longitude: z.number().min(-180, 'Longitude tidak valid').max(180, 'Longitude tidak valid'),
    priority: z.enum(['low', 'medium', 'high']),
    status: z.enum(['issued', 'progress', 'solved']),
    label_id: z.number(),
    desc: z.string().max(1000),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
    item?: Report | null;
    onSuccess: () => void;
    onClose: () => void;
}

export default function ReportForm({ item, onSuccess, onClose }: ItemFormProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLabels = async () => {
        try {
            const res = await api.get('/labels');
            setLabels(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Gagal memuat label');
        }
    };

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
            desc: '',
        },
    });

    useEffect(() => {
        fetchLabels();
        if (item) {
            form.reset({
                pic: undefined,
                jalan: item.jalan,
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                priority: item.priority as any,
                status: item.status as any,
                label_id: item.label_id ?? undefined,
                desc: item.desc,
            });
            setPreview(`http://localhost:8000/${item.pic}`);
        } else {
            form.reset();
            setPreview(null);
        }
    }, [item, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            form.setValue('pic', file);
        }
    };

    const handleMapSelect = async (lat: number, lng: number) => {
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const road = data.address?.road || data.display_name || 'Lokasi tidak diketahui';
            form.setValue('jalan', road);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('jalan', values.jalan);
        formData.append('latitude', String(values.latitude));
        formData.append('longitude', String(values.longitude));
        formData.append('priority', values.priority);
        formData.append('status', values.status);
        formData.append('desc', values.desc);
        if (values.label_id) formData.append('label_id', String(values.label_id));
        if (values.pic instanceof File) formData.append('pic', values.pic);

        try {
            if (item?.id) {
                formData.append('_method', 'PUT');
                await api.post(`/reports/${item.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Report berhasil diupdate');
            } else {
                await api.post('/reports', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Report berhasil ditambahkan');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const lat = form.watch('latitude');
    const lng = form.watch('longitude');

    return (
        // <div className='w-full' style={{ width: '80%' }}>
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className='overflow-y-auto w-full'>
                    {/* ── Two-column grid ── */}
                    <div className="max-w-6xl w-full max-h-[75vh] overflow-y-auto">

                        {/* ════════════════════════════════
                            LEFT COLUMN — Lokasi & Klasifikasi
                        ════════════════════════════════ */}
                        {/* <div className="space-y-4"> */}
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b">
                                Lokasi
                            </p>

                            {/* Nama Jalan */}
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

                            {/* Lat / Lng side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="latitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Latitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.00000001"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
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
                                                <Input
                                                    type="number"
                                                    step="0.00000001"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Map Picker */}
                            <FormItem>
                                <FormLabel>Pilih di Peta</FormLabel>
                                <MapPicker
                                    onSelect={handleMapSelect}
                                    initialLat={lat || undefined}
                                    initialLng={lng || undefined}
                                />
                            </FormItem>

                        {/* </div> */}

                        {/* ════════════════════════════════
                            CENTER COLUMN — Klasifikasi
                        ════════════════════════════════ */}
                        {/* <div className="space-y-4"> */}
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b">
                                Klasifikasi
                            </p>

                            {/* Priority + Status side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <FormControl>
                                                <select {...field} className="w-full border rounded-md p-2 text-sm bg-background">
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
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
                                                <select {...field} className="w-full border rounded-md p-2 text-sm bg-background">
                                                    <option value="issued">Issued</option>
                                                    <option value="progress">Progress</option>
                                                    <option value="solved">Solved</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Label / Jenis Lubang */}
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
                                                className="w-full border rounded-md p-2 text-sm bg-background"
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
                        {/* </div> */}
                        
                        {/* ════════════════════════════════
                            RIGHT COLUMN — Foto & Deskripsi
                        ════════════════════════════════ */}
                        {/* <div className="space-y-4"> */}
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1 border-b">
                                Dokumentasi
                            </p>

                            {/* File upload */}
                            <FormItem>
                                <FormLabel>Foto Laporan</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleFileChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            {/* Preview — fills available vertical space */}
                            <div className="rounded-md border overflow-hidden bg-muted/40" style={{ height: '220px' }}>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs">Belum ada foto</p>
                                    </div>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <FormField
                                control={form.control}
                                name="desc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deskripsi</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Deskripsi kondisi lubang, ukuran, bahaya, dll."
                                                className="resize-none"
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        {/* </div> */}
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-5 mt-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : item ? 'Update Report' : 'Tambah Report'}
                        </Button>
                    </div>
                </form>
            </Form>
        // </div>
    );
}
