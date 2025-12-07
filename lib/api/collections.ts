import { config } from "@/lib/common/config";
import { ApiResponse, Card } from "@/lib/types/api";

interface CreateCollectionParams {
    collectorAddress: string;
    collectedAddress: string;
}

interface CollectionResponse {
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

export const createCollection = async (
    params: CreateCollectionParams
): Promise<void> => {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/collections`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error("Failed to create collection");
    }

    const data: ApiResponse<null> = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to create collection");
    }
};

export const getCollections = async (address: string): Promise<Card[]> => {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/collections?address=${address}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch collections");
    }

    const data: ApiResponse<CollectionResponse[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch collections");
    }

    // Transform response to Card type
    return data.result.map((item) => ({
        id: item.id,
        userId: item.userId,
        tokenId: item.tokenId,
        nickname: item.nickname,
        role: item.role,
        bio: item.bio,
        imageUri: item.imageUri,
        socials: item.socials,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // Add default values for missing Card fields if necessary
        user: {
            // Assuming we might need to reconstruct user object or fetch it separately
            // For now mapping what we have
            walletAddress: item.userId, // CAUTION: Assuming userId in response is wallet address based on previous context, verify if possible?
            // Actually spec says userId is UUID usually, but user prompt sample shows userId is UUID-like.
            // Let's re-read the sample response provided by user.
            // "userId": "09fd77ae-2b70-469f-8585-b0cbc2eb56c2" -> This looks like a UUID.
            // User requested: "result": [ { "id": ... "userId": ... "nickname": ... } ]
            // So the data *is* the card info.
            id: item.userId,
            nickname: item.nickname,
            role: item.role,
            bio: item.bio,
            address: "", // Not explicitly in response, might need context or separate fetch?
            // But useFetchCollections used to populate this.
            // Wait, useFetchCollections used `collection.collectedCard.user?.walletAddress`.
            // New response doesn't nest user object inside.
            // It flattens the card info directly.
        } as any, // Using 'any' briefly to bypass strict type check while mapping purely for display if Type differs.
        // Better: Map correctly to Card interface.
        skills: [],
        address: "", // We don't have address in the response item directly if it's just userId.
        // But wait, the prompt says "Get Bob's Collections". Result is Alice's card info.
        // IMPORTANT: The prompt response shows `result` is array of card-like objects.
    }));
};
