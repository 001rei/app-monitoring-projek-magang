import { tasks } from '@/utils/tasks';
import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

export const useAssignedTasksQueries = (projectId: string ,userId: string) => {
    const queryClient = useQueryClient();

    // Fetch project tasks
    const { data: assignedTasks, isLoading, refetch: refetchTasks } = useQuery({
        queryKey: ['assigned-tasks', userId],
        queryFn: () => tasks.table.getUserTasks(projectId, userId),
        enabled: !!userId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });
    
    const reloadAssignedTasks = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-tasks', userId],
        });
        return refetchTasks();
    };

    return {
        assignedTasks,
        reloadAssignedTasks,
        isLoading
    }
}