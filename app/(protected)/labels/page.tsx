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
import LabelTable from '@/components/Dashboard/LabelTable';
import LabelForm from '@/components/Dashboard/LabelForm';
// import { Item } from '@/types/item';
import { Plus } from 'lucide-react';
import { Label } from '@/types/label';

export default function ItemsPage() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Label | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (item: Label) => {
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

            <LabelTable onEdit={handleEdit} key={refreshKey} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit Item' : 'Tambah Item Baru'}</DialogTitle>
                    </DialogHeader>
                    <LabelForm
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