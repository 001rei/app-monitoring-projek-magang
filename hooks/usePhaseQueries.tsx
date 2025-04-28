import { tasks } from "@/utils/tasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const usePhaseQueries = (projectId: string, phaseLabel: string) => {
    const queryClient = useQueryClient();

    // Fetch project phase details
    const { data: phase, refetch: refetchPhase } = useQuery({
        queryKey: ['project-phase', projectId],
        queryFn: () => tasks.table.getProjectPhase(projectId, phaseLabel),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const reloadPhase = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-phase', projectId],
        });
        return refetchPhase();
    };

    const { data: allPhase, refetch: refetchAllPhase } = useQuery({
        queryKey: ['project-phases', projectId],
        queryFn: () => tasks.table.getAllProjectPhase(projectId),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const reloadAllPhase = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-phases', projectId],
        });
        return refetchAllPhase();
    };

    return {
        phase,
        reloadPhase,
        allPhase,
        reloadAllPhase,
    }
}