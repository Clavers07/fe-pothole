'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import ReportTable from '@/components/Dashboard/ReportTable';
import ReportForm from '@/components/Dashboard/ReportForm';


// import { Item } from '@/types/item';
import { Plus } from 'lucide-react';
import { Report } from '@/types/report';

export default function ItemsPage() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Report | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (item: Report) => {
        setSelectedItem(item);
        setOpen(true);
    ;}
    
    const handleSuccess = () => {
        setOpen(false);
        setSelectedItem(null);
        setRefreshKey((prev) => prev + 1); // trigger re-fetch di ItemTable
    }

    const handleAddNew = () => {
        setSelectedItem(null);
        setOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Daftar Item</h2>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
            </div>

            <ReportTable onEdit={handleEdit} key={refreshKey} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit Item' : 'Tambah Item Baru'}</DialogTitle>
                    </DialogHeader>
                    <ReportForm
                        item={selectedItem}
                        onSuccess={handleSuccess}
                        onClose={() => {
                            setOpen(false);
                            setSelectedItem(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );

}