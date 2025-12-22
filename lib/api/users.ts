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
