import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projects } from '@/utils/projects';
import { tasks } from '@/utils/tasks';

export const useProjectQueries = (projectId: string, taskId?: string, phaseLabel?: string) => {
    const queryClient = useQueryClient();

    // Fetch project tasks
    const { data: projectTasks, isLoading, refetch: refetchTasks } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: () => tasks.table.getProjectTasks(projectId),
        enabled: !!projectId,
        staleTime: Infinity, 
        gcTime: 1000 * 60 * 30,
    }); 

    // Fetch project statuses
    const { data: statuses, refetch: refetchStatuses } = useQuery({
        queryKey: ['project-statuses', projectId],
        queryFn: () => projects.fields.getStatuses(),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    // Fetch project priorities
    const { data: priorities, refetch: refetchPriorities } = useQuery({
        queryKey: ['project-priorities', projectId],
        queryFn: () => projects.fields.getPriorities(),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    // Fetch project members
    const { data: members, refetch: refetchMembers } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => projects.members.getAll(projectId),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    // Reload functions
    const reloadProjectTasks = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-tasks', projectId],
        });
        return refetchTasks();
    };

    const reloadStatuses = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-statuses', projectId],
        });
        return refetchStatuses();
    };

    const reloadPriorities = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-priorities', projectId],
        });
        return refetchPriorities();
    };

    const reloadMembers = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-members', projectId],
        });
        return refetchMembers();
    };

    const { mutate: updateStatusOnTable } = useMutation({
        mutationFn: (statusId: number | undefined) =>
            tasks.details.update(taskId as string, { status: statusId,  }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-tasks', taskId] });
        },
    });

    return {
        // data
        projectTasks,
        statuses,
        priorities,
        isLoading,
        members,
        // reload functions
        reloadProjectTasks,
        reloadStatuses,
        reloadPriorities,
        reloadMembers,
        // update
        updateStatusOnTable,
    }
}