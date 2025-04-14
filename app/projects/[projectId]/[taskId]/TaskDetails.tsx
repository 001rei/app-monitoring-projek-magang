'use client';
import { Separator } from '@/components/ui/separator';
import { UserCard } from '@/components/UserCard';
import { useEffect } from 'react';
import { ITaskWithOptions } from '@/types';
import { TaskDetails } from '../(overview)/TaskDetails';
import { HeaderSection } from '../(overview)/TaskDetails/HeaderSection';
import { useTaskDetails } from '../(overview)/TaskDetailsContext';

export const SingleTaskDetails = ({ task }: { task: ITaskWithOptions }) => {
    const { setSelectedTask } = useTaskDetails();

    useEffect(() => {
        setSelectedTask(task);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);

    return (
        <div className="container p-10">
            <div className="flex">
                <HeaderSection
                    title={task?.title || ''}
                    taskId={task?.id || ''}
                    hideCopyLink
                />
            </div>
            <div className="flex items-center gap-1 text-left text-sm text-gray-500 dark:text-gray-400 w-fit my-2">
                <UserCard
                    id={task?.creator?.id || ''}
                    name={task?.creator?.name || ''}
                    avatarUrl={task?.creator?.avatar || ''}
                    description={task?.creator?.description || ''}
                    avatarStyles="w-6 h-6"
                />
                <span>
                    created this task on {new Date(task?.created_at || '').toDateString()}
                </span>
            </div>
            <Separator className="my-3" />
            <TaskDetails />
        </div>
    );
};