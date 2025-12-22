"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchCardByAddress } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { BaseCard } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Custom hook to get user's card data
 */
export function useMyBaseCard() {
    const { isAuthenticated, accessToken } = useAuth();
    const { isConnected } = useAccount();

    return useQuery<BaseCard | null, Error>({
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
        enabled: isAuthenticated && !!accessToken && isConnected,
        staleTime: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
