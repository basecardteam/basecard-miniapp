"use client";

import { fetchCardByAddress } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to get user's card data
 */
export function useMyBaseCard(address?: string | null) {
    logger.debug("useMyBaseCard hook called", { address });

    return useQuery<Card | null, Error>({
        queryKey: ["myBaseCard", address],
        queryFn: () => fetchCardByAddress(address!),
        enabled: !!address,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
