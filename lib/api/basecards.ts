import { config } from "@/lib/common/config";
import { ApiResponse, Card, CreateCardResponse } from "@/lib/types/api";
import { logger } from "../common/logger";
import { Socials } from "../types";

/**
 * Helper to create headers with optional auth token
 */
function createHeaders(
    accessToken?: string,
    includeContentType: boolean = false
): HeadersInit {
    const headers: HeadersInit = {};
    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }
    if (accessToken && accessToken.length > 0) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
}

/**
 * Fetch all basecards
 * Uses GET /v1/basecards endpoint
 */
export async function fetchAllBaseCards(): Promise<Card[]> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/basecards`);

    if (!response.ok) {
        throw new Error("Failed to fetch cards");
    }

    const data: ApiResponse<Card[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch cards");
    }

    return data.result;
}

/**
 * Fetch card data by wallet address
 * Uses GET /v1/basecards/address/me endpoint
 * Returns null if card not found instead of throwing error
 */
export async function fetchCardByAddress(
    accessToken: string
): Promise<Card | null> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/basecards/me`, {
        headers: createHeaders(accessToken),
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch card");
    }

    const data: ApiResponse<Card | null> = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to fetch card");
    }

    logger.debug("Fetched basecard: ", data.result);

    return data.result;
}

export interface CreateBaseCardParams {
    nickname: string;
    role: string;
    bio: string;
    profileImageFile: File;
    socials: Socials;
}

export async function createBaseCard(
    address: string,
    params: CreateBaseCardParams,
    accessToken: string
): Promise<CreateCardResponse> {
    const formData = new FormData();
    formData.append("address", address);
    formData.append("nickname", params.nickname);
    formData.append("role", params.role);
    formData.append("bio", params.bio || "");
    formData.append("profileImageFile", params.profileImageFile);
    if (params.socials)
        formData.append("socials", JSON.stringify(params.socials));

    const headers: HeadersInit = {};
    if (accessToken && accessToken.length > 0) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${config.BACKEND_API_URL}/v1/basecards`, {
        method: "POST",
        headers,
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

export interface UpdateBaseCardParams {
    nickname: string;
    role: string;
    bio: string;
    socials: Socials;
    profileImageFile: File;
}

export async function updateBaseCard(
    address: string,
    params: UpdateBaseCardParams,
    accessToken: string
): Promise<CreateCardResponse> {
    const formData = new FormData();

    // Always send all fields - empty string means "clear/delete"
    formData.append("nickname", params.nickname);
    formData.append("role", params.role);
    formData.append("bio", params.bio);
    formData.append("socials", JSON.stringify(params.socials));
    formData.append("profileImageFile", params.profileImageFile);

    const headers: HeadersInit = {};
    headers["Authorization"] = `Bearer ${accessToken}`;

    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}`,
        {
            method: "PATCH",
            headers,
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

    const data: ApiResponse<CreateCardResponse> = await response.json();
    logger.debug("Update card response:", data);

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to update card");
    }

    return data.result;
}

export async function rollbackUpdate(
    address: string,
    uploadedFiles: { ipfsId: string },
    accessToken: string
): Promise<void> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}/rollback`,
        {
            method: "POST",
            headers: createHeaders(accessToken, true),
            body: JSON.stringify(uploadedFiles),
        }
    );

    if (!response.ok) {
        const textBody = await response.text().catch(() => "");
        logger.error("Failed to rollback:", textBody);
    }
}

export async function deleteBaseCard(
    address: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/basecards/${address}`,
        {
            method: "DELETE",
            headers: createHeaders(accessToken),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete card");
    }
}
