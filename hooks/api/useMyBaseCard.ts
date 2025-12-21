"use client";

import { fetchCardByAddress } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Custom hook to get user's card data
 */
export function useMyBaseCard() {
    const { address, isConnected } = useAccount();

    return useQuery<Card | null, Error>({
        queryKey: ["myBaseCard", address],
        queryFn: async () => {
            if (!address) {
                return null;
            }
            logger.debug("Fetching myBaseCard data");
            const card = await fetchCardByAddress(address);
            // React Query doesn't allow undefined, ensure we return null
            return card ?? null;
        },
        enabled: isConnected && !!address,
        staleTime: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
