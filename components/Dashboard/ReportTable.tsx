'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
// import { Report } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Report } from '@/types/report';
import { Label } from '@/types/label';

export default function ReportTable({ onEdit }: { onEdit: (report: Report) => void }) {
    const [reports, setReports] = useState<Report[]>([]); // ????
    const [labels, setLabels] = useState<Label[]>([])

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports');
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
            await api.delete(`/reports/${id}`);
            toast.success('Report dihapus');
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
                    <TableHead>Jalan</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Desc</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>
                                <img
                                src={`http://localhost:8000/${report.pic}`} // sesuaikan base URL
                                alt={report.pic}
                                className="h-12 w-12 object-cover rounded"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{report.jalan}</TableCell>
                            <TableCell>{report.latitude}</TableCell>
                            <TableCell>{report.longitude}</TableCell>
                            <TableCell>{report.priority}</TableCell>
                            <TableCell>{report.status}</TableCell>
                            <TableCell>{report.name}</TableCell>
                            <TableCell>{report.desc}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(report)}>
                                Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => report.id && handleDelete(report.id)}>
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