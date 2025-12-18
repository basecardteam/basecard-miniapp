import { useMyBaseCard } from "@/hooks/api/useMyBaseCard";
import { useFetchCollections } from "@/hooks/useFetchCollections";
import {
    CollectionFilterTag,
    filterCollections,
} from "@/lib/filterCollections";
import { sdk } from "@farcaster/miniapp-sdk";
import { useState } from "react";
import { useAccount } from "wagmi";

/**
 * Collection 페이지의 전체 로직을 통합한 훅
 */
export function useCollectionPage() {
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
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
        openUrl: sdk.actions.openUrl,
        myCard,
        isMyCardLoading,
        myCardError,
        isLoading,
        error,
        allCards: data ?? [],
    };
}
