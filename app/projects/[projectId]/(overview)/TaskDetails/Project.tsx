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
import { ITaskAttachment, TaskActivity } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React, { ChangeEvent, useMemo, useState } from 'react';
import { Archive, ChevronDown, File, FileText, Image, Loader2, Plus, PlusCircle, Presentation, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { tasks } from '@/utils/tasks';
import { getFileName } from '@/lib/helpers';

export const Project = () => {
    const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
    const BUCKET_NAME = 'attachments';
    const supabase = createClient();

    const params = useParams();
    const { selectedTask, updateTaskMilestone, updateTaskPriority, updateTaskStatus, updateTaskDates } =
        useTaskDetails();
    const { statuses, priorities, milestones } = useProjectQueries(
        params.projectId as string
    );
    const { task, updateMilestone, updatePriority, updateStatus, updateDates } = useTaskQueries(
        selectedTask?.id || ''
    );
    const { reloadProjectTasks } = useProjectQueries(params.projectId as string);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useCurrentUser();
    const { createActivities } = useActivityQueries(selectedTask?.id || '');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [localAttachments, setLocalAttachments] = useState<Partial<ITaskAttachment>[]>([]);
    const [deletingAttachments, setDeletingAttachments] = useState<string[]>([]);

    const allAttachments = useMemo(() => {
        const baseAttachments = [...(selectedTask?.task_attachments || []), ...localAttachments];
        return baseAttachments.filter(attachment =>
            !deletingAttachments.includes(attachment.file_path as string)
        );
    }, [selectedTask?.task_attachments, localAttachments, deletingAttachments]);

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
            updateDates(updates);
            updateTaskDates?.(selectedTask.id, date);

        } catch (error) {
            toast({
                title: 'Failed to update Dates',
                variant: 'destructive',
            });
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 30 * 1024 * 1024;; // 30MB
        if (file.size > MAX_FILE_SIZE) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Maximum file size is 10MB',
            });
            return;
        }

        try {
            setIsUploading(true);
            const fileType = file.name.split('.').pop();
            const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
            const fileNameStorage = `${crypto.randomUUID()}.${fileType}`;
            const filePath = `${fileNameStorage}`;

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (error) throw error;

            const fullUrl = `${STORAGE_URL}/${BUCKET_NAME}/${data.path}`;

            const attachmentData = {
                project_id: params.projectId as string,
                task_id: selectedTask?.id,
                file_path: fullUrl,
                file_name: fileName,
                file_type: fileType,
                phase_label: selectedTask?.phase_label,
                uploaded_by: user?.id
            };


            await tasks.details.uploadAttachment(attachmentData);
            await reloadProjectTasks();

            toast({
                title: 'Success',
                description: 'Attachment uploaded successfully',
                variant: 'default',
            });

            setLocalAttachments(prev => [...prev, attachmentData]);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to upload attachment. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadAttachment = async (filePath: string, fileName: string) => {
        try {
            const pathParts = filePath.split('/attachments/');
            const storagePath = pathParts.length > 1 ? pathParts[1] : filePath;
            // console.log(storagePath)

            const { data: fileBlob, error } = await supabase.storage
                .from(BUCKET_NAME)
                .download(storagePath);

            if (error) throw error;
            if (!fileBlob) throw new Error('File not found');

            const url = URL.createObjectURL(fileBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || storagePath.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            toast({
                title: 'Download started',
                description: 'File download has begun',
                variant: 'default',
            });

        } catch (error) {
            console.error('Download error:', error);
            toast({
                variant: 'destructive',
                title: 'Download failed',
                description: error instanceof Error
                    ? error.message
                    : 'Unable to download file. Please try again.',
            });
        }
    };

    const handleDeleteFile = async (fileURL: string) => {
        try {
            setIsDeleting(true);

            const fileName = getFileName(fileURL);
            // console.log(`${fileName}`)
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([fileName]);

            if (error) throw error;

            await tasks.details.deleteAttachment(fileURL);
            await reloadProjectTasks();

            setDeletingAttachments(prev => [...prev, fileURL]);
            setLocalAttachments(prev => prev.filter(a => a.file_path !== fileURL));

            toast({
                title: 'Success',
                description: 'Attachment deleted successfully',
            })
        } catch (error) {
            console.error('Error deleting attachment: ', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete attachment. Please try again.',
            });
        } finally {
            setIsDeleting(false);
        }
    }

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
                                {milestone.description && (
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

            <div className="flex justify-between items-center text-gray-500 pb-4">
                <span className="text-xs">Attachments</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {allAttachments.length > 0 ? (
                            <button className="flex items-center text-xs hover:text-gray-700 focus:outline-none transition-colors">
                                ({allAttachments.length})
                                <ChevronDown className="w-3 h-3 ml-1" />
                            </button>
                        ) : (
                            <div>
                                <label
                                    htmlFor="file-upload"
                                    className="flex items-center text-xs text-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
                                >
                                    {isUploading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span className="font-base">Upload Attachment</span>
                                        </>
                                    )}
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    multiple
                                />
                            </div>
                        )}
                    </DropdownMenuTrigger>

                    {allAttachments.length > 0 && (
                        <DropdownMenuContent align="end" className="w-64 p-1">
                            <div className="max-h-[110px] overflow-y-auto">
                                {allAttachments.map((attachment) => {
                                    const isImage = ['jpeg', 'png', 'gif', 'webp', 'jpg'].includes(
                                        attachment.file_type || ''
                                    );

                                    return (
                                        <DropdownMenuItem
                                            key={attachment.file_path}
                                            className="
                                                text-xs px-2 py-1.5 rounded flex justify-between items-center
                                                hover:bg-gray-50 dark:hover:bg-gray-800
                                                focus:bg-gray-50 dark:focus:bg-gray-800
                                                active:bg-gray-50 dark:active:bg-gray-800
                                                data-[highlighted]:bg-gray-50 dark:data-[highlighted]:bg-gray-800
                                                transition-colors
                                            "
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDownloadAttachment(attachment.file_path as string, attachment.file_name as string);
                                            }}
                                        >
                                            <div className="flex items-center min-w-0 flex-1">
                                                {isImage ? (
                                                    <Image className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
                                                ) : attachment.file_type === 'pdf' ? (
                                                    <FileText className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                                                ) : ['doc', 'docx'].includes(attachment.file_type || '') ? (
                                                    <FileText className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                                                ) : ['xls', 'xlsx'].includes(attachment.file_type || '') ? (
                                                    <FileText className="mr-2 h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : ['ppt', 'pptx', 'key'].includes(attachment.file_type || '') ? (
                                                    <Presentation className="mr-2 h-4 w-4 text-orange-500 flex-shrink-0" />
                                                ) : ['zip', 'rar', '7z', 'tar', 'gz'].includes(attachment.file_type || '') ? (
                                                    <Archive className="mr-2 h-4 w-4 text-yellow-600 flex-shrink-0" />
                                                ) : (
                                                    <File className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                                                )}
                                                <span className="truncate pr-2">{attachment.file_name}</span>
                                            </div>
                                            <div className="flex items-center flex-shrink-0">
                                                <span className="text-xs text-gray-400 mr-2">
                                                    {attachment.file_type}
                                                </span>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFile(attachment.file_path as string)
                                                    }}
                                                    title="Delete"
                                                    disabled={isDeleting || deletingAttachments.includes(attachment.file_path as string)}
                                                >
                                                    {deletingAttachments.includes(attachment.file_path as string) || isDeleting ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </div>

                            <DropdownMenuSeparator className="my-1" />

                            <DropdownMenuItem
                                className="
                                    text-xs p-0 rounded 
                                    hover:bg-gray-50 
                                    focus:!bg-gray-50 
                                    active:!bg-gray-50
                                    data-[highlighted]:!bg-gray-50
                                    dark:hover:bg-gray-800
                                    dark:data-[highlighted]:!bg-gray-800
                                "
                                onSelect={(e) => e.preventDefault()}
                                disabled={isUploading}
                            >
                                <label
                                    htmlFor="file-upload"
                                    className="w-full px-2 py-1.5 flex items-center text-blue-500 hover:text-blue-600 cursor-pointer"
                                >
                                    {isUploading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            <span className="font-medium">Add Attachment</span>
                                        </>
                                    )}
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    multiple
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </div>
        </>
    );
};