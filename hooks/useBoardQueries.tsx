import { board } from "@/utils/board";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useBoardQueries = (userId: string) => {
    const queryClient = useQueryClient();

    // Fetch projects
    const { data: boardProjects, isLoading, refetch: refetchBoard } = useQuery({
        queryKey: ['board-projects', userId],
        queryFn: () => board.getProjects(userId),
        enabled: !!userId,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
    }); 

    // Reload
    const reloadBoard = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['board-projects', userId],
        });
        return refetchBoard();
    };

    return {
        boardProjects,
        reloadBoard,
        isLoading
    }
}