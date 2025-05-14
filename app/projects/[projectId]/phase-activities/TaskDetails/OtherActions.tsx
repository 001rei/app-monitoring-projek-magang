'use client';

import { useTaskQueries } from '@/hooks/useTaskQueries';
import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTaskDetails } from '../TaskDetailsContext';
import { DeleteConfirmationDialog } from '../components/DeleteTaskDialog';
import { toast } from '@/hooks/use-toast';
import { TaskDoneConfirmationDialog } from '../components/TaskDoneConfirmationDialog';
import { createClient } from '@/utils/supabase/client';
import { TaskActivity } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useOverviewQueries } from '@/hooks/useOverviewQueries';
import { useBoardQueries } from '@/hooks/useBoardQueries';


export const OtherActions = () => {
    const { projectId } = useParams();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [isDialogDoneOpen, setIsDialogDoneOpen] = useState(false);
    
    const { user } = useCurrentUser();
    const { selectedTask, closeDrawer, updateTaskStatus } = useTaskDetails();
    const { deleteTask, updateStatus } = useTaskQueries(selectedTask?.id || '');
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    const { updateStatusOnTable } = useProjectQueries(projectId as string || "", selectedTask?.id as string);
    const { createActivities } = useActivityQueries(selectedTask?.id || '');
    const { reloadOverview } = useOverviewQueries(projectId as string, selectedTask?.phase_id?.id as string);
    const { reloadBoard } = useBoardQueries(user?.id as string);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            deleteTask();
            await reloadProjectTasks();
            await reloadOverview();
            await reloadBoard();

            closeDrawer();

            toast({
                title: 'Success',
                description: 'The task has been deleted successfully',
            });
        } catch (error) {
            console.error('gagal delete task: ', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete task, please try again'

            })
        } finally {
            setIsDeleting(false);
        }

    };

    const handleDone = async () => {
        const newStatus = 8;
        const oldStatus = selectedTask?.status?.id as number;

        try {
            setIsDone(true);
            const supabase = createClient();

            updateStatus(newStatus || null);
            updateStatusOnTable(newStatus || null);
            await supabase
                .from("tasks")
                .update({ status: newStatus, updated_at: new Date() })
                .eq("parent_task_id", selectedTask?.id as string);

            const activities: {
                task_id: string;
                user_id: string;
                content: TaskActivity;
            }[] = [];

            activities.push({
                task_id: selectedTask?.id as string,
                user_id: user?.id as string,
                content: [
                    { type: 'user', id: user?.id as string },
                    'changed task status from',
                    { type: 'status', id: oldStatus },
                    'to',
                    { type: 'status', id: newStatus },
                    'on',
                    { type: 'date', value: new Date().toISOString() },
                ],
            });

            if (activities.length > 0) {
                await createActivities(activities);
            }

            await reloadProjectTasks();
            await reloadOverview();
            await reloadBoard();

            toast({
                title: 'Success',
                description: 'Task marked as done successfully',
            })
        } catch (error) {
            console.error("Gagal set as done :", error);
            toast({
                variant: 'destructive',
                title: 'Success',
                description: 'Failed to mark the task as done. Please try again',
            })
        } finally {
            setIsDone(false);
        }
    };

    const handleCancel = () => {
        setIsDialogDoneOpen(false);
    }

    const isTaskDone = selectedTask?.status?.label === "Done";


    return (
        <div className="py-4">
            <Button
                onClick={() => setIsDialogDeleteOpen(true)}
                className="flex h-6 py-4 px-4 justify-start w-full text-red-500 hover:bg-red-200 hover:dark:bg-red-950"
                disabled={isDeleting}
                variant={'ghost'}
            >
                <Trash className="w-3 h-3 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>

            <Button
                onClick={() => setIsDialogDoneOpen(true)}
                className="flex h-6 py-4 px-4 justify-start w-full text-green-500 hover:bg-green-200 hover:dark:bg-green-950"
                disabled={isDone || isTaskDone}
                variant={'ghost'}
            >
                <Check className="w-3 h-3 mr-2" />
                {isTaskDone ? 'Already done' : 'Set as done'}
            </Button>

            <DeleteConfirmationDialog
                isOpen={isDialogDeleteOpen}
                onOpenChange={setIsDialogDeleteOpen}
                taskId={selectedTask?.id}
                projectId={projectId as string}
                onConfirm={handleDelete}
            />

            <TaskDoneConfirmationDialog
                isOpen={isDialogDoneOpen}
                onClose={handleCancel}
                onConfirm={handleDone}
            />
        </div>
    );
};