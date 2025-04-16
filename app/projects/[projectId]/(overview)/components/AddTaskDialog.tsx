import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AddTaskForm from './AddTaskForm';
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useProjectQueries } from "@/hooks/useProjectQueries";

interface AddTaskDialogProps {
    phaseId: string,
    phaseLabel: string;
    taskId?: string;
    taskTitle?: string;
    isOpen: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function AddTaskDialog({phaseId, phaseLabel, taskId, taskTitle, isOpen, onOpenChange}: AddTaskDialogProps) {
    const params = useParams();
    const { statuses, priorities, milestones } = useProjectQueries(params.projectId as string);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            { !taskId && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4" />
                        Add Task
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="md:max-w-xl sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{taskId ? 'Add Subtask' : 'Add Task'}</DialogTitle>
                    <DialogDescription>{taskTitle && (`Task: ${taskTitle}`)}</DialogDescription>
                </DialogHeader>
                <AddTaskForm
                    phaseId={phaseId}
                    phaseLabel={phaseLabel}
                    statuses={statuses}
                    priorities={priorities}
                    milestones={milestones}
                    taskId={taskId}
                    onSuccess={() => onOpenChange?.(false)}
                />
            </DialogContent>
        </Dialog>
    )
}