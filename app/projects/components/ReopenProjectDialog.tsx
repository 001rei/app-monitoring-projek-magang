import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReopenProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const ReopenProjectDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: ReopenProjectDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reopen Project</DialogTitle>
                <DialogDescription>
                    Ready to bring this project back to life? Reopening will move it to your active projects.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={onConfirm}>Reopen Project</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);