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
    id: string;
    userId: string;
    tokenId: number | null;
    txHash: string | null;
    nickname: string | null;
    role: string | null;
    bio: string | null;
    imageUri: string | null;
    socials: Record<string, string> | null;
    createdAt: string;
    updatedAt: string;
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
