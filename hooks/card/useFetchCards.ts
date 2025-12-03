import { Card, ApiResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

const CARDS_QUERY_KEY = ["cards"];
const FIVE_MINUTES = 5 * 60 * 1000;

import { BACKEND_API_URL } from "@/lib/common/config";

const fetchCardsData = async (): Promise<Card[]> => {
    const response = await fetch(`${BACKEND_API_URL}/v1/cards`);

    if (!response.ok) {
        throw new Error("Failed to fetch cards");
    }

    const data: ApiResponse<Card[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch cards");
    }

    return data.result;
};

export function useFetchCards() {
    return useQuery<Card[], Error>({
        queryKey: CARDS_QUERY_KEY,
        queryFn: fetchCardsData,
        staleTime: FIVE_MINUTES,
        gcTime: FIVE_MINUTES * 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
    });
}
