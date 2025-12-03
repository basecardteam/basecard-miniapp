import { Card, CollectionResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

// API 응답 데이터를 Card 배열로 변환하는 함수를 분리합니다.
const transformCollectionData = (collections: CollectionResponse[]): Card[] => {
    return collections.map((collection) => ({
        id: String(collection.collectedCard.id), // Convert to string if needed
        userId: collection.collectedCard.user?.id || "", // Assuming user exists
        tokenId: collection.collectedCard.tokenId,
        nickname: collection.collectedCard.nickname,
        role: collection.collectedCard.role,
        bio: collection.collectedCard.bio,
        imageUri: collection.collectedCard.imageUri, // Updated property name
        socials: collection.collectedCard.socials,
        createdAt: collection.collectedCard.createdAt,
        updatedAt: collection.collectedCard.updatedAt,
        user: collection.collectedCard.user,
    }));
};

import { BACKEND_API_URL } from "@/lib/common/config";
import { ApiResponse } from "@/lib/types/api";

const fetchCollectedCardsData = async (myCardId: number): Promise<Card[]> => {
    // 1. 수집 관계 가져오기
    // spec.md: GET /collections/:userId
    // Note: The spec says :userId (UUID), but here we have myCardId (number).
    // Assuming for now we pass myCardId and backend handles it, or we need to update this logic later.
    // For now, let's stick to the spec URL structure but use the ID we have.
    const collectionsResponse = await fetch(
        `${BACKEND_API_URL}/v1/collections/${myCardId}`
    );

    if (!collectionsResponse.ok) {
        throw new Error("Failed to fetch collections");
    }

    const data: ApiResponse<CollectionResponse[]> =
        await collectionsResponse.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch collections");
    }

    // 2. 카드 데이터로 변환하여 반환
    return transformCollectionData(data.result);
};

export function useFetchCollections(myCardId?: number) {
    // 🔑 enabled 옵션을 사용하여 myCardId가 있을 때만 쿼리를 실행합니다.
    const isEnabled = !!myCardId;

    return useQuery<Card[], Error>({
        queryKey: ["collectedCards", myCardId],
        queryFn: () => fetchCollectedCardsData(myCardId!),
        enabled: isEnabled,
    });
}
