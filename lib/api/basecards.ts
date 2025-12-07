import { config } from "@/lib/common/config";
import { ApiResponse, Card, CreateCardResponse } from "@/lib/types/api";

/**
 * Fetch card data by wallet address
 * Returns null if card not found (404) instead of throwing error
 */
export async function fetchCardByAddress(
    address: string
): Promise<Card | null> {
    // spec.md does not explicitly list GET /cards/:address, but we assume filtering by address is supported
    // or we use the list endpoint and filter.
    // Let's try GET /v1/cards?address={address}
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards?address=${address}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch card");
    }

    const data: ApiResponse<Card[]> = await response.json();

    if (!data.success || !data.result) {
        // If success is false, it might mean error, but if result is null/empty list, it means not found?
        // If the API returns a list, we check if it's empty.
        if (
            data.result &&
            Array.isArray(data.result) &&
            data.result.length === 0
        ) {
            return null;
        }
        throw new Error(data.error || "Failed to fetch card");
    }

    // Assuming the API returns a list of cards filtered by address, we take the first one.
    // If the API returns a single object (if we used a different endpoint), we would need to adjust.
    // Based on spec "Get All Cards" returns a list.
    const cards = data.result;
    return cards.length > 0 ? cards[0] : null;
}

export interface CreateBaseCardParams {
    // user address
    address: string;
    // basecard mint arguments
    nickname: string;
    role: string;
    bio?: string;
    profileImageFile: File;
    socials?: Record<string, string>;
}

export async function createBaseCard(
    params: CreateBaseCardParams
): Promise<CreateCardResponse> {
    const formData = new FormData();
    formData.append("address", params.address);
    formData.append("nickname", params.nickname);
    formData.append("role", params.role);
    formData.append("bio", params.bio || "");
    formData.append("profileImageFile", params.profileImageFile);
    if (params.socials)
        formData.append("socials", JSON.stringify(params.socials));

    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${params.address}`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create card");
    }

    const data: ApiResponse<CreateCardResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to create card");
    }

    return data.result;
}

export async function updateCardTokenId(
    address: string,
    tokenId: number | null,
    txHash?: string
): Promise<void> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tokenId, txHash }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tokenId");
    }
}

export async function deleteBaseCard(address: string): Promise<void> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete card");
    }
}
