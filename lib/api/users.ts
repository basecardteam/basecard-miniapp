import { config } from "@/lib/common/config";
import { ApiResponse, User } from "@/lib/types/api";
import { createHeaders } from "../utils";

/**
 * Get current user info by JWT token
 */
export async function fetchUser(accessToken: string): Promise<User> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/users/me`, {
        method: "GET",
        headers: createHeaders(accessToken),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    const data: ApiResponse<User> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to fetch user");
    }

    return data.result;
}

export interface NotificationDetails {
    url: string;
    token: string;
}

export interface UpsertNotificationResponse {
    success: boolean;
}

/**
 * Upsert notification token and URL for push notifications
 * Called when user adds miniapp to home screen
 */
export async function upsertNotificationToken(
    accessToken: string,
    details: NotificationDetails,
    clientFid: number
): Promise<UpsertNotificationResponse> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/users/me/notification`,
        {
            method: "POST",
            headers: createHeaders(accessToken),
            body: JSON.stringify({
                clientFid,
                notificationToken: details.token,
                notificationUrl: details.url,
            }),
        }
    );

    if (!response.ok) {
        let errorMessage = "Failed to save notification settings";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            // Ignore JSON parse error
        }
        throw new Error(errorMessage);
    }

    const data: ApiResponse<UpsertNotificationResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to save notification settings");
    }

    return { success: true };
}
