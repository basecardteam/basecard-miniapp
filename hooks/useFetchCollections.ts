import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { getCollections } from "@/lib/api/collections";

export function useFetchCollections(address?: string) {
    // 🔑 enabled 옵션을 사용하여 address가 있을 때만 쿼리를 실행합니다.
    const isEnabled = !!address;

    return useQuery<Card[], Error>({
        queryKey: ["collectedCards", address],
        queryFn: () => getCollections(address!),
        enabled: isEnabled,
    });
}
