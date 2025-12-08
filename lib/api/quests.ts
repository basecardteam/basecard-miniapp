import { config } from "@/lib/common/config";
import { ApiResponse, Quest } from "@/lib/types/api";

/**
 * Fetch all active quests
 */
export async function fetchQuests(): Promise<Quest[]> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/quests`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
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
