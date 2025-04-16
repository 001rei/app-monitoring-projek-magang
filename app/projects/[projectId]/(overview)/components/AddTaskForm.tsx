"use client"

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { IMilestone, IPriority, IStatus } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { tasks } from "@/utils/tasks";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { Textarea } from "@/components/ui/textarea";
import { DateRange } from "react-day-picker";

interface AddTaskFromProps {
    statuses?: IStatus[];
    priorities?: IPriority[];
    milestones?: IMilestone[];
    onSuccess?: () => void;
    phaseId: string;
    taskId?: string;
    phaseLabel: string;
}

export default function AddTaskForm({ statuses, priorities, milestones, onSuccess, phaseId, phaseLabel, taskId }: AddTaskFromProps) {
    const params = useParams();
    const projectId = params.projectId;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [milestone, setMilestone] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); 
    const [isCreating, setIsCreating] = useState(false);
    const { reloadProjectTasks } = useProjectQueries(projectId as string);

    const filteredMilestones = useMemo(() => {
        return milestones?.filter(milestone => milestone.phase_label === phaseLabel) || [];
    }, [milestones, phaseLabel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsCreating(true);
            const supabase = createClient();

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const taskData = {
                phase_id: phaseId,
                phase_label: phaseLabel,
                project_id: projectId as string,
                title,
                description,
                status: status || null,   
                priority: priority || null,   
                milestone: milestone || null,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                created_by: user.id,
                ...(taskId && { parent_task_id: taskId }), 
            };

            await tasks.details.create(taskData);
            await reloadProjectTasks();

            toast({
                title: 'Success',
                description: 'Task created successfully'
            });

            if (onSuccess) {
                onSuccess();
            }
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
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="milestone">Milestone</Label>
                <Select value={milestone} onValueChange={setMilestone}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select milestone" />
                    </SelectTrigger>
                    <SelectContent aria-placeholder="Select milestone">
                        {filteredMilestones?.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id}>
                                {milestone.description ? milestone.description : milestone.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent aria-placeholder="Select status">
                        {statuses?.map((status) => (
                            <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
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
                    <SelectContent aria-placeholder="Select priority">
                        {priorities?.map((priority) => (
                            <SelectItem key={priority.id} value={priority.id}>{priority.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                                "Select task timeline"
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : (taskId ? 'Add Subtask' : 'Add Task')}
            </Button>
        </form>
    );
}