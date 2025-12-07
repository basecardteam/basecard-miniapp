import { useFetchCollections } from "@/hooks/useFetchCollections";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { CollectionFilterTag } from "@/unused/collection";
import { filterCollections } from "@/unused/utils";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import { useAccount } from "wagmi";

/**
 * Collection 페이지의 전체 로직을 통합한 훅
 */
export function useCollectionPage() {
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
    const openUrl = useOpenUrl();
    const { address } = useAccount();

    // 사용자 카드 정보 조회
    const {
        data: myCard,
        isLoading: isMyCardLoading,
        error: myCardError,
    } = useMyBaseCard();

    // 컬렉션 카드 목록 조회
    const { data, isLoading, error } = useFetchCollections(address);

    // 필터링된 카드 목록
    const { filteredCards, tags } = filterCollections(data, selectedTag);

    return {
        selectedTag,
        setSelectedTag,
        tags,
        filteredCards,
        openUrl,
        myCard,
        isMyCardLoading,
        myCardError,
        isLoading,
        error,
        allCards: data ?? [],
    };
}
