'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function ItemTable({ onEdit }: { onEdit: (item: Item) => void }) {
    const [items, setItems] = useState<Item[]>([]); // ????

    const fetchItems = async () => {
        try {
            const res = await api.get('/items');
            setItems(res.data);
        } catch {
            toast.error('Gagal memuat data');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin hapus?')) return;
        try {
            await api.delete(`/items/${id}`);
            toast.success('Item dihapus');
            fetchItems();
        } catch {
            toast.error('Gagal menghapus');
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <img
                                src={`http://localhost:8000/${item.pic}`} // sesuaikan base URL
                                alt={item.nama}
                                className="h-12 w-12 object-cover rounded"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{item.nama}</TableCell>
                            <TableCell>{item.tahun}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                                Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => item.id && handleDelete(item.id)}>
                                Hapus
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}