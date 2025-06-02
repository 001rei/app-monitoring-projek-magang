'use client';

import { ITaskWithOptions } from "@/types";
import { TaskDetailsProvider } from "../TaskDetailsContext";
import { TaskDetailsDrawer } from "../TaskDetailsDrawer";
import { TaskActionsCell } from "./TaskActionsCell";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAssignedTasksQueries } from "@/hooks/useAssignedTasksQueries";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Props {
    row: any;
}

export default function OpenTaskDetails({ row }: Props) {
    const params = useParams();
    const projectId = params.projectId;

    const { user } = useCurrentUser();
    const { projectTasks, reloadProjectTasks } = useProjectQueries(projectId as string);
    const { reloadAssignedTasks } = useAssignedTasksQueries(projectId as string, user?.id as string)
    const [tasks, setTasks] = useState<ITaskWithOptions[]>(projectTasks || []);

    const handleTaskUpdate = async (
                    taskId: string,
                    updates: Partial<ITaskWithOptions>
                ) => {
                    try {
                        if ('milestone' in updates || 'status' in updates || 'priority' in updates || 'startDate' in updates ||
                            'endDate' in updates) {
                            await reloadProjectTasks();
                            await reloadAssignedTasks();
                        } else {
                            setTasks((prev) =>
                                prev.map((task) =>
                                    task.id === taskId
                                        ? { ...task, ...(updates as Partial<ITaskWithOptions>) }
                                        : task
                                )
                            );
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
            <TaskActionsCell row={row} projectId={projectId as string} />
            <TaskDetailsDrawer />
        </TaskDetailsProvider>
    );
}