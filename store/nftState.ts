import { atom } from "jotai";

// 메타데이터 타입을 정의합니다.
// NFT 표준(ERC721/ERC1155)에 따라 기본적으로 name, description, image 등이 포함됩니다.
export interface NFTMetadata {
    name: string;
    description: string;
    image: string; // 이미지 URI
    attributes?: Array<{
        trait_type: string;
        value: any;
    }>;
    // 기타 필요한 필드 추가
    [key: string]: any;
}

// 각 NFT는 ID와 그에 해당하는 메타데이터를 갖도록 상태를 변경합니다.
export interface NFTItem {
    tokenId: bigint;
    metadata: NFTMetadata | null;
}

export interface NFTState {
    items: NFTItem[];
    count: number;
    isLoading: boolean;
    isError: boolean;
}

const initialNFTState: NFTState = {
    items: [],
    count: 0,
    isLoading: true,
    isError: false,
};

export const nftDataAtom = atom(initialNFTState);

export const updateNftDataAtom = atom(null, (get, set, update: NFTState) => {
    set(nftDataAtom, update);
});