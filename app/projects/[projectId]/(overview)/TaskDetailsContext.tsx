import { ITaskWithOptions } from '@/types';
import { createContext, useContext, useState } from 'react';

interface TaskDetailsContextType {
    selectedTask: ITaskWithOptions | null;
    isDrawerOpen: boolean;
    openDrawer: (task: ITaskWithOptions) => void;
    setSelectedTask: (task: ITaskWithOptions | null) => void;
    closeDrawer: () => void;
    updateTaskTitle?: (taskId: string, newTitle: string) => void;
    updateTaskDescription?: (taskId: string, description: string) => void;
    updateTaskStatus?: (
        taskId: string,
        status: { id: string; label: string; color: string } | undefined
    ) => void;
    updateTaskPriority?: (
        taskId: string,
        priority:
            | { id: string; label: string; color: string; }
            | undefined
    ) => void;
}

const TaskDetailsContext = createContext<TaskDetailsContextType | undefined>(
    undefined
);

export function TaskDetailsProvider({
    children,
    onTaskUpdate,
}: {
    children: React.ReactNode;
    onTaskUpdate?: (taskId: string, updates: Partial<ITaskWithOptions>) => void;
}) {
    const [selectedTask, setSelectedTask] = useState<ITaskWithOptions | null>(
        null
    );

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = (task: ITaskWithOptions) => {
        setSelectedTask(task);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedTask(null);
    };

    const updateTaskTitle = (taskId: string, newTitle: string) => {
        setSelectedTask((prev) =>
            prev?.id === taskId ? { ...prev, title: newTitle } : prev
        );
        onTaskUpdate?.(taskId, { title: newTitle });
    };

    const updateTaskDescription = (taskId: string, description: string) => {
        setSelectedTask((prev) =>
            prev?.id === taskId ? { ...prev, description } : prev
        );
        onTaskUpdate?.(taskId, { description });
    };

    const updateTaskStatus = (
        taskId: string,
        status: { id: string; label: string; color: string } | undefined
    ) => {
        setSelectedTask((prev) =>
            prev?.id === taskId ? { ...prev, status: status || undefined } : prev
        );
        onTaskUpdate?.(taskId, { status });
    };

    const updateTaskPriority = (
        taskId: string,
        priority:
            | { id: string; label: string; color: string; }
            | undefined
    ) => {
        setSelectedTask((prev) =>
            prev?.id === taskId ? { ...prev, priority: priority || undefined } : prev
        );
        onTaskUpdate?.(taskId, { priority });
    };

    return (
        <TaskDetailsContext.Provider
            value={{
                selectedTask,
                isDrawerOpen,
                openDrawer,
                setSelectedTask,
                closeDrawer,
                updateTaskTitle,
                updateTaskDescription,
                updateTaskStatus,
                updateTaskPriority,
            }}
        >
            {children}
        </TaskDetailsContext.Provider>
    );
}

export const useTaskDetails = () => {
    const context = useContext(TaskDetailsContext);
    if (context === undefined) {
        throw new Error('useTaskDetails must be used within a TaskDetailsProvider');
    }
    return context;
};