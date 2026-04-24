'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MapPin } from "lucide-react";
// import { Report } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Report } from '@/types/report';
import { Badge } from "@/components/ui/badge";
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
                    <TableHead className="text-center">Lokasi</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Label</TableHead>
                    <TableHead>Desc</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>
                                <img
                                    src={`http://localhost:8000/${report.pic}`}
                                    alt={report.pic}
                                    className="h-12 w-12 object-cover rounded-md mx-auto"
                                />
                            </TableCell>
                            <TableCell className="font-medium max-w-[180px] truncate">
                                {report.jalan}
                            </TableCell>

                            <TableCell className='text-center'>
                                <a
                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors"
                                    title="Lihat di peta"
                                >
                                    {/* Icon */}
                                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />

                                    {/* Lat Lng */}
                                    <div className="flex flex-col text-[10px] leading-tight text-muted-foreground">
                                    <span>{report.latitude}</span>
                                    <span>{report.longitude}</span>
                                    </div>
                                </a>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    variant={
                                    report.priority === "high"
                                        ? "destructive"
                                        : report.priority === "medium"
                                        ? "secondary"
                                        : "outline"
                                    }
                                >
                                    {report.priority}
                                </Badge>
                                </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    className={
                                    report.status === "finished"
                                        ? "bg-green-500 text-white"
                                        : report.status === "processed"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-500 text-white"
                                    }
                                >
                                    {report.status}
                                </Badge>
                                </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline">
                                    {report.name}
                                </Badge>
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate text-muted-foreground">
                                {report.desc}
                            </TableCell>
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