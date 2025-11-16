import { Card } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const CARDS_QUERY_KEY = ["cards"];
const FIVE_MINUTES = 5 * 60 * 1000;

const fetchCardsData = async (): Promise<Card[]> => {
    const response = await fetch("/api/cards");

    if (!response.ok) {
        throw new Error("Failed to fetch cards");
    }

    return response.json();
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