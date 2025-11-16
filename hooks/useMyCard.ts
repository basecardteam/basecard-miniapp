"use client";

import { Card } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetch card data by wallet address
 * Returns null if card not found (404) instead of throwing error
 */
async function fetchCardByAddress(address: string): Promise<Card | null> {
    const response = await fetch(`/api/card/${address}`);
    if (!response.ok) {
        if (response.status === 404) {
            // 404는 정상적인 상태 (카드가 없음) - null 반환
            return null;
        }
        throw new Error("Failed to fetch card");
    }

    const data = await response.json();
    return data;
}

/**
 * Custom hook to get user's card data
 */
export function useMyCard(address?: string) {
    return useQuery({
        queryKey: ["card", address],
        queryFn: () => fetchCardByAddress(address!),
        enabled: !!address, // Only fetch if address exists
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // 404는 null을 반환하므로 에러가 아니므로, 다른 에러만 재시도
        // address가 없을 때는 쿼리가 실행되지 않으므로 (enabled: false)
        // isLoading: false, isFetched: false 상태
        // 이를 MainHome에서 처리
    });
}
