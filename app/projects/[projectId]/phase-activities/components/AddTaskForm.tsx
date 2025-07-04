"use client"

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { IMilestone, IPriority, IStatus } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { tasks } from "@/utils/tasks";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { Textarea } from "@/components/ui/textarea";
import { DateRange } from "react-day-picker";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBoardQueries } from "@/hooks/useBoardQueries";
import { cn } from "@/lib/utils";
import { useOverviewQueries } from "@/hooks/useOverviewQueries";

interface AddTaskFromProps {
    onSuccess?: () => void;
    phaseId: string;
    phaseLabel: string;
    isPhaseDone: boolean;
    milestoneId: string;
    milestoneLabel: string;
    isMilestoneDone: boolean;
    taskId?: string;
    statuses?: IStatus[];
    priorities?: IPriority[];
}

export default function AddTaskForm({ 
    statuses, priorities, onSuccess, 
    phaseId, phaseLabel, taskId, isPhaseDone,
    milestoneId, milestoneLabel, isMilestoneDone
}: AddTaskFromProps) {
    const params = useParams();
    const projectId = params.projectId;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<number>();
    const [priority, setPriority] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { user } = useCurrentUser();
    const { reloadOverview } = useOverviewQueries(projectId as string, phaseId);
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    const { reloadBoard } = useBoardQueries(user?.id as string);

    const filteredStatuses = useMemo(() => {
        return statuses?.filter(status => status.label !== 'Overdue' && status.label !== 'Done')
            .sort((a, b) => a.order - b.order) || [];
    }, [statuses]);

    const sortedPriorities = useMemo(() => {
        return priorities?.sort((a ,b) => a.order - b.order) || [];
    }, [priorities]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "Title is required";
        } else if (title.length > 50) {
            newErrors.title = "Title must be less than 50 characters";
        }

        if (description.length > 500) {
            newErrors.description = "Description must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsCreating(true);
            const supabase = createClient();

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const taskData = {
                phase_id: phaseId,
                milestone_id: milestoneId,
                milestone_label: milestoneLabel,
                phase_label: phaseLabel,
                project_id: projectId as string,
                title,
                description,
                status: status || undefined,
                priority: priority || null,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                created_by: user.id,
                ...(taskId && { parent_task_id: taskId }),
            };

            await Promise.all([
                tasks.details.create(taskData),
                reloadProjectTasks(),
                reloadOverview(),
                reloadBoard(),
            ]);

            toast({
                title: 'Success',
                description: 'Task created successfully',
                variant: 'default',
            });

            if (onSuccess) {
                onSuccess();
            }

            // Reset form
            setTitle("");
            setDescription("");
            setStatus(undefined);
            setPriority("");
            setDateRange(undefined);
            setErrors({});
        } catch (error) {
            console.error('Error creating task:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create task. Please try again.',
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="title">Title *</Label>
                    <span className="text-xs text-muted-foreground">
                        {title.length}/50
                    </span>
                </div>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    placeholder="Enter task title"
                    className={cn(errors.title && "border-red-500")}
                />
                {errors.title && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">
                        {description.length}/500
                    </span>
                </div>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    placeholder="Enter task description"
                    className={cn("min-h-[100px]", errors.description && "border-red-500")}
                />
                {errors.description && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={status?.toString()} 
                        onValueChange={(value) => setStatus(Number(value))} 
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredStatuses?.map((status) => (
                                <SelectItem
                                    key={status.id}
                                    value={status.id.toString()} 
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedPriorities?.map((priority) => (
                                <SelectItem key={priority.id} value={priority.id}>
                                    {priority.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>


            <div className="space-y-2">
                <Label htmlFor="dateRange">Task period</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    format(dateRange.from, "dd/MM/yyyy")
                                )
                            ) : (
                                <span className="text-muted-foreground">Select task timeline</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isCreating || isPhaseDone}
            >
                {isCreating ? (
                    <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Creating...
                    </span>
                ) : (
                    taskId ? 'Add Subtask' : 'Add Task'
                )}
            </Button>

            {isPhaseDone && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Cannot add tasks to a completed phase</span>
                </div>
            )}
        </form>
    );
}