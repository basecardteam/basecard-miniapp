import { config } from "@/lib/common/config";
import { ApiResponse, User } from "@/lib/types/api";

/**
 * Get or Create User by wallet address
 */
export async function fetchUser(
    walletAddress: string,
    accessToken?: string
): Promise<User> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (accessToken && accessToken.length > 0) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${config.BACKEND_API_URL}/v1/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ walletAddress }),
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
