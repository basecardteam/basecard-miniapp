import { config } from "@/lib/common/config";
import { ApiResponse, Card } from "@/lib/types/api";
import { createHeaders } from "../utils";

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

export const addCollection = async (
    accessToken: string,
    basecardId: string
): Promise<void> => {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/collections`, {
        method: "POST",
        headers: createHeaders(accessToken),
        body: JSON.stringify({ basecardId }),
    });

    const data: ApiResponse<null> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add to collection");
    }
};

export const deleteCollection = async (
    accessToken: string,
    basecardId: string
): Promise<void> => {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/collections/${basecardId}`,
        {
            method: "DELETE",
            headers: createHeaders(accessToken),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to remove from collection");
    }

    const data: ApiResponse<null> = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to remove from collection");
    }
};

export const fetchCollections = async (
    accessToken: string
): Promise<Card[] | null> => {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/collections/me`,
        {
            method: "GET",
            headers: createHeaders(accessToken),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch collections");
    }

    const data: ApiResponse<Card[] | null> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch collections");
    }

    return data.result;
};
