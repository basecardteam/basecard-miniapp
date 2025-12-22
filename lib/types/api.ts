/**
 * Shared type definitions for BaseCard
 */

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Generic API Response - spec.md에 정의된 표준 응답 포맷
 */
export interface ApiResponse<T> {
    success: boolean;
    result: T | null;
    error: string | null;
}

// =============================================================================
// Social Types
// =============================================================================

/**
 * Allowed social keys
 */
export const SOCIAL_KEYS = [
    "x",
    "farcaster",
    "website",
    "github",
    "linkedin",
    "basename",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type Socials = Partial<Record<SocialKey, string>>;

// =============================================================================
// Entity Types
// =============================================================================

export interface UserWallet {
    id: string;
    userId: string;
    walletAddress: string;
    clientType: "farcaster" | "baseapp";
    clientFid: number;
    createdAt: string;
}

export interface User {
    id: string;
    walletAddress: string;
    fid?: number;
    totalPoints: number;
    isNewUser: boolean;
    hasMintedCard: boolean;
    profileImage?: string;
    wallets?: UserWallet[];
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
    socials: Socials | null;
}

export interface Quest {
    id: string;
    title: string;
    description: string | null;
    rewardAmount: number;
    actionType: string;
    status?: "pending" | "claimable" | "completed";
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

// =============================================================================
// API Request/Response Types
// =============================================================================

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
    uploadedFiles?: {
        s3Key: string;
        ipfsId: string;
    };
}

export interface VerifyQuestResponse {
    verified?: boolean;
    rewarded?: number;
    newTotalPoints?: number;
    success?: boolean;
    updated?: { questId: string; status: string }[];
}
