"use client";

import { fetchBaseCardById } from "@/lib/api/basecards";
import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch a single BaseCard by ID
 * Used for viewer mode to fetch card details
 */
export function useBaseCard(cardId?: string) {
    return useQuery<Card | null, Error>({
        queryKey: ["basecard", cardId],
        queryFn: () =>
            cardId ? fetchBaseCardById(cardId) : Promise.resolve(null),
        enabled: !!cardId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
