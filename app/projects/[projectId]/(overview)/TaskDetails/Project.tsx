'use client';

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
import { TaskActivity } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo } from 'react';

export const Project = () => {
    const params = useParams();
    const { selectedTask, updateTaskMilestone, updateTaskPriority, updateTaskStatus, updateTaskDates } =
        useTaskDetails();
    const { statuses, priorities, milestones } = useProjectQueries(
        params.projectId as string
    );
    const { task, updateMilestone, updatePriority, updateStatus, updateDates } = useTaskQueries(
        selectedTask?.id || ''
    );
    const { user } = useCurrentUser();
    const { createActivities } = useActivityQueries(selectedTask?.id || '');

    const handlePrioritySelect = async (priorityId: string | null) => {
        if (!selectedTask?.id) return;

        const newPriority = priorityId
            ? priorities?.find((p) => p.id === priorityId) || null
            : null;

        const oldPriority = priorities?.find((p) => p.id === selectedTask?.priority?.id);

        if (oldPriority?.id === newPriority?.id) {
            return;
        }

        try {
            await updatePriority(priorityId || null);
            updateTaskPriority?.(selectedTask.id, newPriority);

            const activities: {
                task_id: string;
                user_id: string;
                content: TaskActivity;
            }[] = [];

            if (oldPriority && newPriority) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'changed task priority from',
                        { type: 'priority', id: oldPriority.id },
                        'to',
                        { type: 'priority', id: newPriority.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            } else if (oldPriority && !newPriority) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'removed task priority',
                        { type: 'priority', id: oldPriority.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            } else if (!oldPriority && newPriority) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'set task priority to',
                        { type: 'priority', id: newPriority.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            }

            if (activities.length > 0) {
                await createActivities(activities);
            }
        } catch (error) {
            toast({
                title: 'Failed to update priority',
                variant: 'destructive',
            });
        }
    };

    const handleStatusSelect = async (statusId: string | null) => {
        if (!selectedTask?.id) return;

        const newStatus = statusId
            ? statuses?.find((s) => s.id === statusId) || null
            : null;

        const oldStatus = statuses?.find((s) => s.id === selectedTask?.status?.id);

        if (oldStatus?.id === newStatus?.id) {
            return;
        }

        try {
            await updateStatus(statusId || null);
            updateTaskStatus?.(selectedTask.id, newStatus);

            const activities: {
                task_id: string;
                user_id: string;
                content: TaskActivity;
            }[] = [];

            if (oldStatus && newStatus) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'changed task status from',
                        { type: 'status', id: oldStatus.id },
                        'to',
                        { type: 'status', id: newStatus.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            } else if (oldStatus && !newStatus) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'removed task status',
                        { type: 'status', id: oldStatus.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            } else if (!oldStatus && newStatus) {
                activities.push({
                    task_id: selectedTask.id,
                    user_id: user?.id as string,
                    content: [
                        { type: 'user', id: user?.id as string },
                        'set task status to',
                        { type: 'status', id: newStatus.id },
                        'on',
                        { type: 'date', value: new Date().toISOString() },
                    ],
                });
            }

            if (activities.length > 0) {
                await createActivities(activities);
            }
        } catch (error) {
            toast({
                title: 'Failed to update status',
                variant: 'destructive',
            });
        }
    };

    const handleMilestoneSelect = async (milestoneId: string | null) => {
        if (!selectedTask?.id) return;

        const newMilestone = milestoneId
            ? milestones?.find((m) => m.id === milestoneId) || null
            : null;

        try {
            await updateMilestone(milestoneId || null);
            updateTaskMilestone?.(selectedTask.id, newMilestone);
        } catch (error) {
            toast({
                title: 'Failed to update milestone',
                variant: 'destructive',
            });
        }
    };

    const handleDateChange = async (
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

        try {
            await updateDates(updates);
            updateTaskDates?.(selectedTask.id, date);

        } catch (error) {
            toast({
                title: 'Failed to update Dates',
                variant: 'destructive',
            });
        }
    };

    const filteredMilestones = useMemo(() => {
        if (!milestones || !selectedTask?.phase_label) return [];

        return milestones
            .filter((milestone) =>
                milestone.phase_label === selectedTask.phase_label
            )
            .sort((a, b) => (a.milestone_order ?? 0) - (b.milestone_order ?? 0));
    }, [milestones, selectedTask?.phase_label]);

    const startDate = task?.startDate ? new Date(task.startDate) : undefined;
    const endDate = task?.endDate ? new Date(task.endDate) : undefined;

    const sortedPriorities = priorities?.sort((a, b) => a.order - b.order);
    const sortedStatuses = statuses?.sort((a, b) => a.order - b.order);

    const isTaskDone = task?.status?.label === 'Done';

    return (
        <>
            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Milestone</span>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="text-xs"
                        disabled={isTaskDone}
                    >
                        {task?.milestone ? (
                            <CustomFieldTagRenderer
                                color={task.milestone.color}
                                label={task.milestone.label}
                            />
                        ) : (
                            'None'
                        )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                        <DropdownMenuLabel className="text-xs">
                            Set Milestone
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleMilestoneSelect(null)}>
                            <span className="w-3 h-3 mr-2" />
                            <div className="flex-grow">None</div>
                        </DropdownMenuItem>
                        {filteredMilestones?.map((milestone) => (
                            <Tooltip key={milestone.id}>
                                <TooltipTrigger asChild>
                                    <DropdownMenuItem
                                        onClick={() => handleMilestoneSelect(milestone.id)}
                                        className="flex items-center w-full"
                                    >
                                        <span
                                            className="w-3 h-3 mr-2 border rounded-full"
                                            style={{ borderColor: milestone.color }}
                                        />
                                        <div className="flex-grow">{milestone.label}</div>
                                    </DropdownMenuItem>
                                </TooltipTrigger>
                                { milestone.description && (
                                    <TooltipContent side="right" align="start" sideOffset={13}>
                                        <p>{milestone.description}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Priority</span>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="text-xs"
                        disabled={isTaskDone}
                    >
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
                            <Tooltip key={priority.id}>
                                <TooltipTrigger asChild>
                                    <DropdownMenuItem
                                        onClick={() => handlePrioritySelect(priority.id)}
                                        className="flex items-center w-full"
                                    >
                                        <span
                                            className="w-3 h-3 mr-2 border rounded-full"
                                            style={{ borderColor: priority.color }}
                                        />
                                        <div className="flex-grow">{priority.label}</div>
                                    </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" sideOffset={13}>
                                    <p>{priority.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Status</span>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="text-xs"
                        disabled={isTaskDone} 
                    >
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
                        <DropdownMenuLabel className="text-xs">Set Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusSelect(null)}>
                            <span className="w-3 h-3 mr-2" />
                            <div className="flex-grow">None</div>
                        </DropdownMenuItem>
                        {sortedStatuses
                            ?.filter((status) => status.label !== 'Done')
                            .map((status) => (
                                <Tooltip key={status.id}>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuItem
                                            onClick={() => handleStatusSelect(status.id)}
                                            className="flex items-center w-full"
                                        >
                                            <span
                                                className="w-3 h-3 mr-2 border rounded-full"
                                                style={{ borderColor: status.color }}
                                            />
                                            <div className="flex-grow">{status.label}</div>
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" sideOffset={13}>
                                        <p>{status.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-between text-gray-500 py-2">
                <span className="text-xs">Start date</span>
                <DatePicker
                    date={startDate}
                    onSelect={(date) => !isTaskDone && handleDateChange('startDate', date)}
                    disabled={isTaskDone} 
                />
            </div>

            <div className="flex justify-between text-gray-500 pt-2 pb-4">
                <span className="text-xs">End date</span>
                <DatePicker
                    date={endDate}
                    onSelect={(date) => !isTaskDone && handleDateChange('endDate', date)} 
                    disabled={isTaskDone} 
                />
            </div>
        </>
    );
};