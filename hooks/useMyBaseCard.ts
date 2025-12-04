"use client";

import { fetchCardByAddress } from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { Card } from "@/lib/types/api";
import { walletAddressAtom } from "@/store/walletState";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

/**
 * Custom hook to get user's card data
 */
export function useMyBaseCard(address?: string | null) {
    const globalAddress = useAtomValue(walletAddressAtom);
    const targetAddress = address || globalAddress;

    return useQuery<Card | null, Error>({
        queryKey: ["myBaseCard", targetAddress],
        queryFn: () => {
            logger.debug("Fetching myBaseCard data", { targetAddress });
            return fetchCardByAddress(targetAddress!);
        },
        enabled: !!targetAddress,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
