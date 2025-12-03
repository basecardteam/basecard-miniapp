import { baseCardAbi } from "@/lib/abi/abi";
import { decodeEventLog } from "viem";

/**
 * Extract tokenId from transaction receipt
 */
export function extractTokenIdFromReceipt(receipt: any): bigint | undefined {
    try {
        // Find MintBaseCard event in logs
        for (const log of receipt.logs) {
            try {
                const decoded = decodeEventLog({
                    abi: baseCardAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (decoded.eventName === "MintBaseCard" && decoded.args) {
                    const args = decoded.args as unknown as {
                        tokenId: bigint;
                        user?: string;
                    };
                    const tokenId = args.tokenId;
                    console.log("✅ TokenId extracted from receipt:", tokenId);
                    return tokenId;
                }
            } catch (e) {
                // Not the event we're looking for, continue
                continue;
            }
        }
    } catch (error) {
        console.error("❌ Error extracting tokenId from receipt:", error);
    }
    return undefined;
}
