"use client";

import { fetchAllBaseCards, fetchBaseCardById } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { BaseCard, BaseCardDetail } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch a single BaseCard by ID (includes farcasterProfile)
 * Used for viewer mode to fetch card details
 */
export function useBaseCard(cardId?: string) {
    return useQuery<BaseCardDetail | null, Error>({
        queryKey: ["basecard", cardId],
        queryFn: () =>
            cardId ? fetchBaseCardById(cardId) : Promise.resolve(null),
        enabled: !!cardId,
        staleTime: 1000 * 10, // 10 seconds
    });
}

/**
 * Hook to fetch all BaseCards
 * Used for explore/collection views
 */
export function useBaseCards() {
    return useQuery<BaseCard[], Error>({
        queryKey: ["basecards"],
        queryFn: async () => {
            logger.debug("Fetching all basecards");
            return fetchAllBaseCards();
        },
        staleTime: 1000 * 10, // 10 seconds
        retry: 1,
    });
}
