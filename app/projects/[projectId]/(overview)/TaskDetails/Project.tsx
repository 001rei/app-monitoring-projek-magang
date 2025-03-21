'use client';
useTaskDetails
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useTaskQueries, DateUpdates } from '@/hooks/useTaskQueries';
import { useParams } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DatePicker } from './DatePicker';
import { CustomFieldTagRenderer } from '@/components/CustomFieldTagRenderer';
import { useTaskDetails } from '../TaskDetailsContext';
import { toast } from '@/hooks/use-toast';

export const Project = () => {
    const params = useParams();
    const { selectedTask, updateTaskPriority, updateTaskStatus } =
        useTaskDetails();
    const { statuses, priorities } = useProjectQueries(
        params.projectId as string
    );
    const { task, updatePriority, updateStatus, updateDates } = useTaskQueries(
        selectedTask?.id || ''
    );

    const handlePrioritySelect = async (priorityId: string | null) => {
        if (!selectedTask?.id) return;

        const priority = priorityId
            ? priorities?.find((p) => p.id === priorityId) || null
            : null;

        try {
            await updatePriority(priorityId || null);
            updateTaskPriority?.(selectedTask.id, priority);
        } catch (error) {
            toast({
                title: 'Failed to update priority',
                variant: 'destructive',
            });
        }
    };

    const handleStatusSelect = async (priorityId: string | null) => {
        if (!selectedTask?.id) return;

        const status = priorityId
            ? statuses?.find((p) => p.id === priorityId) || null
            : null;

        try {
            await updateStatus(priorityId || null);
            updateTaskStatus?.(selectedTask.id, status);
            
        } catch (error) {
            toast({
                title: 'Failed to update priority',
                variant: 'destructive',
            });
        }
    };

    const handleDateChange = (
        type: 'startDate' | 'endDate',
        date: Date | undefined
    ) => {
        if (!selectedTask?.id) return;

        const updates: DateUpdates = {
            startDate:
                type === 'startDate'
                    ? date?.toISOString() || null
                    : (task?.startDate as any) || null,
            endDate:
                type === 'endDate'
                    ? date?.toISOString() || null
                    : (task?.endDate as any) || null,
        };
        updateDates(updates);
    };

    const startDate = task?.startDate ? new Date(task.startDate) : undefined;
    const endDate = task?.endDate ? new Date(task.endDate) : undefined;

    const sortedPriorities = priorities?.sort((a, b) => a.order - b.order);
    const sortedStatuses = statuses?.sort((a, b) => a.order - b.order);

    return (
        <>
            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Priority</span>
                <DropdownMenu>
                    <DropdownMenuTrigger className="text-xs">
                        {task?.priority ? (
                            <CustomFieldTagRenderer
                                color={task.priority.color}
                                label={task.priority.label}
                            />
                        ) : (
                            'None'
                        )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                        <DropdownMenuLabel className="text-xs">
                            Set Priority
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePrioritySelect(null)}>
                            <span className="w-3 h-3 mr-2" />
                            <div className="flex-grow">None</div>
                        </DropdownMenuItem>
                        {sortedPriorities?.map((priority) => (
                            <DropdownMenuItem
                                key={priority.id}
                                onClick={() => handlePrioritySelect(priority.id)}
                            >
                                <span
                                    className="w-3 h-3 mr-2 border rounded-full"
                                    style={{ borderColor: priority.color }}
                                />
                                <div className="flex-grow">{priority.label}</div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Status</span>
                <DropdownMenu>
                    <DropdownMenuTrigger className="text-xs">
                        {task?.status ? (
                            <CustomFieldTagRenderer
                                color={task.status.color}
                                label={task.status.label}
                            />
                        ) : (
                            'None'
                        )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                        <DropdownMenuLabel className="text-xs">Set Staus</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusSelect(null)}>
                            <span className="w-3 h-3 mr-2" />
                            <div className="flex-grow">None</div>
                        </DropdownMenuItem>
                        {sortedStatuses?.map((status) => (
                            <DropdownMenuItem
                                key={status.id}
                                onClick={() => handleStatusSelect(status.id)}
                            >
                                <span
                                    className="w-3 h-3 mr-2 border rounded-full"
                                    style={{ borderColor: status.color }}
                                />
                                <div className="flex-grow">{status.label}</div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Start date</span>
                <DatePicker
                    date={startDate}
                    onSelect={(date) => handleDateChange('startDate', date)}
                />
            </div>

            <div className="flex justify-between text-gray-500 pt-2 pb-4">
                <span className="text-xs">End date</span>
                <DatePicker
                    date={endDate}
                    onSelect={(date) => handleDateChange('endDate', date)}
                />
            </div>
        </>
    );
};