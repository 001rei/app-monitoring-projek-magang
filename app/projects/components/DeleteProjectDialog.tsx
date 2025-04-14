import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>; // Mengubah menjadi async function
    projectName: string;
}

export const DeleteProjectDialog = ({
    open,
    onOpenChange,
    onConfirm,
    projectName,
}: DeleteProjectDialogProps) => {
    const [confirmName, setConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (confirmName !== projectName) return;

        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Project Permanently</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the
                        project and all associated data.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500">
                        Please type <span className="font-semibold">{projectName}</span> to
                        confirm.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};