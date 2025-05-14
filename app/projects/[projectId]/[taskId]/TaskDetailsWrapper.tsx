'use client';

import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useParams } from 'next/navigation';
import { SingleTaskDetails } from './TaskDetails';
import { toast } from '@/hooks/use-toast';
import { ITaskWithOptions } from '@/types';
import { TaskDetailsProvider } from '../phase-activities/TaskDetailsContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAssignedTasksQueries } from '@/hooks/useAssignedTasksQueries';

export const TaskDetailsWrapper = ({ task }: { task: ITaskWithOptions }) => {
    const { projectId } = useParams();
    const { user } = useCurrentUser();
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    const { reloadAssignedTasks } = useAssignedTasksQueries(projectId as string, user?.id as string)

    const handleTaskUpdate = async (
        _taskId: string,
        updates: Partial<ITaskWithOptions>
    ) => {
        try {
            if ('status' in updates || 'priority' in updates || 'startDate' in updates || 'endDate' in updates) {
                await reloadProjectTasks();
                await reloadAssignedTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update task',
            });
        }
    };

    return (
        <TaskDetailsProvider onTaskUpdate={handleTaskUpdate}>
            <SingleTaskDetails task={task} />
        </TaskDetailsProvider>
    );
};