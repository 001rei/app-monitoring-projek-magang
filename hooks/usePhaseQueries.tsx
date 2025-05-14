import { tasks } from "@/utils/tasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const usePhaseQueries = (projectId: string, phaseLabel: string) => {
    const queryClient = useQueryClient();

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

    const { data: currentPhase, refetch: refetchCurrentPhase } = useQuery({
        queryKey: ['current-phase', projectId],
        queryFn: () => tasks.table.getCurrentPhase(projectId),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const reloadCurrentPhase = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['current-phase', projectId],
        });
        return refetchCurrentPhase();
    };

    return {
        phase,
        allPhase,
        currentPhase,
        reloadPhase,
        reloadAllPhase,
        reloadCurrentPhase
    }
}