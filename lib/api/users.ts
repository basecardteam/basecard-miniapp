import { BACKEND_API_URL } from "@/lib/common/config";
import { ApiResponse, User } from "@/lib/types/api";

/**
 * Get or Create User by wallet address
 */
export async function fetchUser(walletAddress: string): Promise<User> {
    const response = await fetch(`${BACKEND_API_URL}/v1/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
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
