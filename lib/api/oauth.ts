import { config } from "@/lib/common/config";
import { ApiResponse } from "@/lib/types/api";

const BACKEND_URL = config.BACKEND_API_URL;

export type OAuthProvider = "github" | "x" | "linkedin";

export type ProviderKey = "github" | "x" | "linkedin";

export interface InitOAuthResponse {
    authUrl: string;
    state: string;
}

export interface OAuthStatusResponse {
    connected: boolean;
    username?: string;
    displayName?: string;
    verified?: boolean; // Added based on service implementation
}

/**
 * Initialize OAuth flow
 */
export async function initOAuth(
    provider: ProviderKey,
    accessToken: string,
    clientFid?: string,
    returnUrl: string = "/edit-profile",
): Promise<InitOAuthResponse> {
    const params = new URLSearchParams({
        clientFid: clientFid || "",
        returnUrl,
    });

    const response = await fetch(
        `${BACKEND_URL}/v1/oauth/${provider}/init?${params.toString()}`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    );

    const data: ApiResponse<InitOAuthResponse> = await response.json();
    console.log("[initOAuth] response data:", data);

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to initialize OAuth");
    }

    return data.result;
}

/**
 * Check OAuth connection status
 */
export async function getOAuthStatus(
    provider: ProviderKey,
    accessToken: string,
): Promise<OAuthStatusResponse> {
    const response = await fetch(`${BACKEND_URL}/v1/oauth/${provider}/status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error("Failed to check status");
    }

    const data: ApiResponse<OAuthStatusResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to check status");
    }

    return data.result;
}

/**
 * Disconnect OAuth provider
 */
export async function disconnectOAuth(
    provider: ProviderKey,
    accessToken: string,
): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/v1/oauth/${provider}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to disconnect: ${response.status} ${errorText}`,
        );
    }
}
