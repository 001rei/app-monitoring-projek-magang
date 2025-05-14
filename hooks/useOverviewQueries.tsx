import { projects } from "@/utils/projects";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useOverviewQueries = (projectId: string, phaseId: string) => {
    const queryClient = useQueryClient();

    const { data: projectOverview, isLoading, refetch: refetchOverview } = useQuery({
        queryKey: ['project-overview', projectId],
        queryFn: () => projects.getOverviewData(projectId, phaseId),
        enabled: !!projectId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    });

    const reloadOverview = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['project-overview', projectId],
        });
        return refetchOverview();
    };

    return {
        projectOverview,
        reloadOverview,
        isLoading
    }
}