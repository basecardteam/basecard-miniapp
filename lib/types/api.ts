/**
 * Generic API Response
 * spec.md에 정의된 표준 응답 포맷
 */
export interface ApiResponse<T> {
    success: boolean;
    result: T | null;
    error: string | null;
}

export interface CreateCardResponse {
    profile_image: string;
    card_data: {
        nickname: string;
        role: string;
        bio: string;
        imageUri: string;
    };
    social_keys: string[];
    social_values: string[];
}

export interface User {
    walletAddress: string;
    totalPoints: number;
    isNewUser: boolean;
    hasMintedCard: boolean;
    profileImage: string;
}

export interface Card {
    tokenId: number;
    nickname: string;
    role: string;
    bio: string;
    imageUri: string; // NFT Metadata URI (IPFS)
    socials: Record<string, string>;
    skills: string[]; // Not in DB but in spec
}

export interface Quest {
    title: string;
    description: string | null;
    rewardAmount: number;
    actionType: string;
}

export interface VerifyQuestResponse {
    verified: boolean;
    rewarded: number;
    newTotalPoints: number;
}

export interface Collection {
    id: string;
    collectorUserId: string;
    collectedCardId: string;
}

export interface PointLog {
    userId: string;
    amount: number;
    type: "QUEST_REWARD" | "MINT_BONUS" | "REFERRAL" | "ADMIN_ADJUST";
    referenceId: string | null;
}
