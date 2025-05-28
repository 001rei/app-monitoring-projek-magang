import { tasks } from "@/utils/tasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useMilestoneQueries = (projectId: string, phaseLabel: string) => {
    const queryClient = useQueryClient();

    const { data: allMilestone, refetch: reftechAllMilestone } = useQuery({
        queryKey: ['project-milestones', projectId],
        queryFn: () => tasks.table.getAllProjectMilestones(projectId),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const { data: currentMilestones, refetch: refetchCurrentMilestones } = useQuery({
        queryKey: ['current-milestones', projectId],
        queryFn: () => tasks.table.getCurrentMilestones(projectId, phaseLabel),
        enabled: !!projectId && !!phaseLabel,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const reloadAllMilestone = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-milestones', projectId],
        });
        return reftechAllMilestone();
    };

    const reloadCurrentMilestones = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['current-milestones', projectId],
        });
        return refetchCurrentMilestones();
    };

    return {
        allMilestone,
        currentMilestones,
        reloadAllMilestone,
        reloadCurrentMilestones
    }
}