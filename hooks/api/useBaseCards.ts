import { fetchAllBaseCards } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { BaseCard } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

export function useBaseCards() {
    const query = useQuery<BaseCard[], Error>({
        queryKey: ["basecards"],
        queryFn: async () => {
            logger.debug("Fetching all basecards");
            const cards = await fetchAllBaseCards();
            return cards;
        },
        staleTime: 1000 * 10, // 10 seconds - fetch fast to check updates
        retry: 1,
    });

    return query;
}
