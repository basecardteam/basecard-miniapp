import { fetchActiveQuests } from "@/lib/api/quests";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook for public active quests (no authentication required)
 */
export function useActiveQuests() {
    const {
        data: quests,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["activeQuests"],
        queryFn: fetchActiveQuests,
        staleTime: 1000 * 60, // 1 minute
    });

    return {
        quests: quests || [],
        isLoading,
        error: error ? (error as Error).message : null,
        refetch,
    };
}
