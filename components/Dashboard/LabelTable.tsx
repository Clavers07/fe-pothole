'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
// import { Report } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
// import { Report } from '@/types/report';
import { Label } from '@/types/label';

export default function LabelTable({ onEdit }: { onEdit: (label: Label) => void }) {
    const [reports, setReports] = useState<Report[]>([]); // ????
    const [labels, setLabels] = useState<Label[]>([])

    const fetchReports = async () => {
        try {
            const res = await api.get('/labels');
            // setReports(res.data);
            
            const reportsWithLabelName = res.data.map((report: any) => ({
                ...report,
                name: report.label?.name || "-"
            }));

            setReports(reportsWithLabelName);
            // console.log(res.data);
            
        } catch {
            toast.error('Gagal memuat data');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin hapus?')) return;
        try {
            await api.delete(`/labels/${id}`);
            toast.success('Label dihapus');
            fetchReports();
        } catch {
            toast.error('Gagal menghapus');
        }
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

    useEffect(() => {
        fetchReports();
        fetchLabels();
    }, []);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {labels.map((label) => (
                        <TableRow key={label.id}>
                            <TableCell>
                                <img
                                src={`http://localhost:8000/${label.pic}`} // sesuaikan base URL
                                alt={label.pic}
                                className="h-12 w-12 object-cover rounded"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{label.name}</TableCell>
                            <TableCell>{label.name}</TableCell>
                            <TableCell>{label.desc}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(label)}>
                                Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => label.id && handleDelete(label.id)}>
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