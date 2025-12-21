import { config } from "@/lib/common/config";
import { ApiResponse, Quest, VerifyQuestResponse } from "@/lib/types/api";
import { logger } from "../common/logger";
import { createHeaders } from "../utils";

/**
 * Fetch all quests (without user status) - requires auth
 */
export async function fetchQuests(accessToken: string): Promise<Quest[]> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/quests`, {
        method: "GET",
        headers: createHeaders(accessToken),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch quests");
    }

    const data: ApiResponse<Quest[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch quests");
    }

    return data.result;
}

/**
 * Fetch active quests (public, no auth required)
 */
export async function fetchActiveQuests(): Promise<Quest[]> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/quests/active`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch active quests");
    }

    const data: ApiResponse<Quest[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch active quests");
    }

    return data.result;
}

/**
 * Fetch user's quests with completion status from userQuests table
 */
export async function fetchUserQuests(accessToken: string): Promise<Quest[]> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/user-quests/me`,
        {
            method: "GET",
            headers: createHeaders(accessToken),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user quests");
    }

    const data: ApiResponse<Quest[]> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch user quests");
    }

    return data.result;
}

/**
 * Claim a quest reward after on-chain verification
 */
export async function claimQuest(
    questId: string,
    accessToken: string
): Promise<VerifyQuestResponse> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/user-quests/claim`,
        {
            method: "POST",
            headers: createHeaders(accessToken),
            body: JSON.stringify({ questId }),
        }
    );

    if (!response.ok) {
        let errorMessage = "Failed to claim quest";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            // Ignore JSON parse error and use default message
        }
        throw new Error(errorMessage);
    }

    const data: ApiResponse<VerifyQuestResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to claim quest");
    }

    logger.debug("Claimed quest: ", data.result);

    return data.result;
}

/**
 * Request manual verification for a quest
 */
export async function verifyQuest(
    accessToken: string
): Promise<VerifyQuestResponse> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/user-quests/verify`,
        {
            method: "POST",
            headers: createHeaders(accessToken),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to verify quest");
    }

    const data: ApiResponse<VerifyQuestResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to verify quest");
    }

    return data.result;
}
