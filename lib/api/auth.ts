import { config } from "@/lib/common/config";
import { ApiResponse } from "@/lib/types/api";

export interface AuthUser {
    id: string;
    walletAddress: string;
    fid?: number;
    role?: string;
    totalPoints?: number;
}

export interface AuthResponse {
    accessToken: string;
    user: AuthUser;
}

// Backend response uses snake_case
interface RawAuthResponse {
    access_token: string;
    user: AuthUser;
}

/**
 * Login with Farcaster Quick Auth token
 * Backend verifies the JWT using @farcaster/quick-auth
 */
export async function loginWithFarcaster(token: string): Promise<AuthResponse> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/auth/login/farcaster`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to login with Farcaster");
    }

    const data: ApiResponse<RawAuthResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to login with Farcaster");
    }

    // Map snake_case to camelCase
    return {
        accessToken: data.result.access_token,
        user: data.result.user,
    };
}

/**
 * Login with wallet signature (MetaMask, etc.)
 * Backend verifies the signature matches the address
 */
export async function loginWithWallet(
    address: string,
    message: string,
    signature: string
): Promise<AuthResponse> {
    const response = await fetch(
        `${config.BACKEND_API_URL}/v1/auth/login/wallet`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ address, message, signature }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to login with wallet");
    }

    const data: ApiResponse<RawAuthResponse> = await response.json();

    if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to login with wallet");
    }

    // Map snake_case to camelCase
    return {
        accessToken: data.result.access_token,
        user: data.result.user,
    };
}

/**
 * Generate a sign-in message for wallet authentication
 */
export function generateSignInMessage(address: string): string {
    const nonce = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    return `Sign in to BaseCard\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
}
