import { useFetchCollections } from "@/hooks/card/useFetchCollections";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { CollectionFilterTag } from "@/lib/legacy/collection";
import { filterCollections } from "@/lib/legacy/utils";
import { walletAddressAtom } from "@/store/walletState";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useAtom } from "jotai";
import { useState } from "react";

/**
 * Collection 페이지의 전체 로직을 통합한 훅
 */
export function useCollectionPage() {
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
    const openUrl = useOpenUrl();
    const [address] = useAtom(walletAddressAtom);

    // 사용자 카드 정보 조회
    const {
        data: myCard,
        isLoading: isMyCardLoading,
        error: myCardError,
    } = useMyBaseCard(address);

    // 컬렉션 카드 목록 조회
    const { data, isLoading, error } = useFetchCollections(myCard?.id);

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
