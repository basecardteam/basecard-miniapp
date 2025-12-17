import { config } from "@/lib/common/config";
import { ApiResponse, Card, CreateCardResponse } from "@/lib/types/api";
import { logger } from "../common/logger";

/**
 * Fetch card data by wallet address
 * Uses GET /v1/basecards/address/:address endpoint
 * Returns null if card not found instead of throwing error
 */
export async function fetchCardByAddress(
    address: string
): Promise<Card | null> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/address/${address}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch card");
    }

    const data: ApiResponse<Card | null> = await response.json();

    // Standard API response: { success: true, result: Card | null, error: null }
    if (!data.success) {
        throw new Error(data.error || "Failed to fetch card");
    }

    logger.debug("Fetched basecard: ", data.result);

    // Return null if no card found, otherwise return the card
    return data.result;
}

export interface CreateBaseCardParams {
    nickname: string;
    role: string;
    bio?: string;
    profileImageFile: File;
    socials?: Record<string, string>;
}

export async function createBaseCard(
    address: string,
    params: CreateBaseCardParams
): Promise<CreateCardResponse> {
    const formData = new FormData();
    formData.append("address", address);
    formData.append("nickname", params.nickname);
    formData.append("role", params.role);
    formData.append("bio", params.bio || "");
    formData.append("profileImageFile", params.profileImageFile);
    if (params.socials)
        formData.append("socials", JSON.stringify(params.socials));

    const response = await fetch(`${config.BACKEND_API_URL}/v1/basecards`, {
        method: "POST",
        body: formData,
    });

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

export interface UpdateBaseCardParams {
    nickname?: string;
    role?: string;
    bio?: string;
    socials?: Record<string, string>;
    profileImageFile?: File;
}

export async function updateBaseCard(
    address: string,
    params: UpdateBaseCardParams
): Promise<CreateCardResponse> {
    const formData = new FormData();

    if (params.nickname) formData.append("nickname", params.nickname);
    if (params.role) formData.append("role", params.role);
    if (params.bio !== undefined) formData.append("bio", params.bio);
    if (params.socials)
        formData.append("socials", JSON.stringify(params.socials));
    if (params.profileImageFile)
        formData.append("profileImageFile", params.profileImageFile);

    // Debug: log what's being sent
    logger.debug("Update card request - address:", address);
    logger.debug("Update card request - params:", params);
    logger.debug(
        "Update card request - formData entries:",
        Object.fromEntries(formData.entries())
    );

    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}`,
        {
            method: "PATCH",
            body: formData,
        }
    );

    if (!response.ok) {
        let errorMessage = `Failed to update card (status: ${response.status})`;
        try {
            const errorData = await response.json();
            logger.error("Update card error response:", errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            const textBody = await response.text().catch(() => "");
            logger.error("Failed to parse error response:", textBody);
        }
        throw new Error(errorMessage);
    }

    // Response format: { success: true, result: { card_data, social_keys, social_values } }
    const data: ApiResponse<CreateCardResponse> = await response.json();
    logger.debug("Update card response:", data);

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to update card");
    }

    return data.result;
}

export async function rollbackUpdate(
    address: string,
    uploadedFiles: { s3Key: string; ipfsId: string }
): Promise<void> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}/rollback`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(uploadedFiles),
        }
    );

    if (!response.ok) {
        // Rollback failure is critical but we can only log it here
        const textBody = await response.text().catch(() => "");
        logger.error("Failed to rollback:", textBody);
        // We don't throw error here to avoid masking the original error that caused rollback
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
