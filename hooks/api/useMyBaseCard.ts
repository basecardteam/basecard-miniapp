"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchCardByAddress } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to get user's card data
 */
export function useMyBaseCard() {
    const { isAuthenticated, accessToken } = useAuth();

    return useQuery<Card | null, Error>({
        queryKey: ["myBaseCard", accessToken],
        queryFn: async () => {
            if (!accessToken) {
                return null;
            }
            logger.debug("Fetching myBaseCard data");
            const card = await fetchCardByAddress(accessToken);
            // React Query doesn't allow undefined, ensure we return null
            return card ?? null;
        },
        // Only fetch when connected, have address, AND authenticated
        enabled: isAuthenticated && !!accessToken,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
