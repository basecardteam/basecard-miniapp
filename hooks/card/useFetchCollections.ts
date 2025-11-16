import { Card, CollectionResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";


// API 응답 데이터를 Card 배열로 변환하는 함수를 분리합니다.
const transformCollectionData = (collections: CollectionResponse[]): Card[] => {
    return collections.map((collection) => ({
        id: collection.collectedCard.id,
        nickname: collection.collectedCard.nickname,
        bio: collection.collectedCard.bio ?? "",
        role: collection.collectedCard.role ?? "",
        imageURI: collection.collectedCard.imageURI ?? "",
        profileImage: collection.collectedCard.profileImage ?? "",
        address: collection.collectedCard.address,
        basename: collection.collectedCard.basename || "default.base.name",
        skills: collection.collectedCard.skills ?? [],
        tokenId: collection.collectedCard.tokenId,
    }));
};

const fetchCollectedCardsData = async (myCardId: number): Promise<Card[]> => {
    // 1. 수집 관계 가져오기
    const collectionsResponse = await fetch(`/api/collections?id=${myCardId}`);

    if (!collectionsResponse.ok) {
        throw new Error("Failed to fetch collections");
    }

    const collections: CollectionResponse[] = await collectionsResponse.json();

    // 2. 카드 데이터로 변환하여 반환
    return transformCollectionData(collections);
};

export function useFetchCollections(myCardId?: number) {
    // 🔑 enabled 옵션을 사용하여 myCardId가 있을 때만 쿼리를 실행합니다.
    const isEnabled = !!myCardId;

    return useQuery<Card[], Error>({
        queryKey: ['collectedCards', myCardId],
        queryFn: () => fetchCollectedCardsData(myCardId!),
        enabled: isEnabled,
    });
}