import { config } from "@/lib/common/config";
import { ApiResponse, User } from "@/lib/types/api";
import { createHeaders } from "./quests";

/**
 * Get or Create User by wallet address
 */
export async function fetchUser(
    address: string,
    accessToken: string
): Promise<User> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/users`, {
        method: "POST",
        headers: createHeaders(accessToken),
        body: JSON.stringify({ walletAddress: address }),
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
