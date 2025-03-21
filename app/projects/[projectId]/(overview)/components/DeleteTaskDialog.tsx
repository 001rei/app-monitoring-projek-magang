'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    taskId?: string;
    projectId?: string;
    onConfirm?: () => Promise<void>; 
}

export function DeleteConfirmationDialog({
    isOpen,
    onOpenChange,
    taskId,
    onConfirm,
}: DeleteConfirmationDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if(!onConfirm) return;
        try {
            setIsDeleting(true);
            await onConfirm(); 
        } catch (error) {
            console.error('Error deleting task:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete task. Please try again.',
            });
        } finally {
            setIsDeleting(false);
            onOpenChange(false); 
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the task
                        and its subtasks.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}