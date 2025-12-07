import { PublicClient } from "viem";
import { REQUIRED_CHAIN_ID } from "@/lib/constants/chainId";
import { logger } from "./common/logger";

/**
 * Ensure user is on the correct network
 */
export async function ensureCorrectNetwork(
    publicClient: PublicClient,
    switchChainAsync: (args: { chainId: number }) => Promise<any>
) {
    if (!switchChainAsync) {
        throw new Error("Network switching is not available");
    }

    if (!publicClient) {
        throw new Error("Public client is not available");
    }

    const currentChainId = await publicClient.getChainId();
    logger.debug("Current chain id: ", {
        chainId: currentChainId,
    });
    if (currentChainId === REQUIRED_CHAIN_ID) {
        return;
    }

    try {
        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });

        // Wait for chain switch
        for (let i = 0; i < 30; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const chainId = await publicClient.getChainId();
            if (chainId === REQUIRED_CHAIN_ID) return;
        }

        throw new Error("Network switch timeout");
    } catch (error) {
        // Check for user rejection
        const isUserRejection =
            error instanceof Error &&
            (error.message.toLowerCase().includes("rejected") ||
                error.message.toLowerCase().includes("denied"));

        if (isUserRejection) {
            throw new Error("Network switch cancelled");
        }
        throw error;
    }
}
