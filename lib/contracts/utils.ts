import { baseCardAbi } from "@/lib/abi/abi";
import { decodeEventLog } from "viem";

/**
 * Extract tokenId from transaction receipt
 */
export function extractTokenIdFromReceipt(receipt: any): bigint | undefined {
    try {
        console.log(
            "🔍 Extracting TokenId from receipt logs...",
            receipt.logs?.length
        );

        // Find MintBaseCard event in logs
        for (const log of receipt.logs) {
            try {
                const decoded = decodeEventLog({
                    abi: baseCardAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (decoded.eventName === "MintBaseCard" && decoded.args) {
                    const args = decoded.args as any;
                    // Check if tokenId exists in args (it should be there as named property)
                    if (args.tokenId !== undefined) {
                        const tokenId = BigInt(args.tokenId);
                        console.log(
                            "✅ TokenId extracted from receipt:",
                            tokenId
                        );
                        return tokenId;
                    }
                }
            } catch (e) {
                // Not the event we're looking for, continue
                continue;
            }
        }
        console.warn("⚠️ MintBaseCard event not found in receipt logs");
    } catch (error) {
        console.error("❌ Error extracting tokenId from receipt:", error);
    }
    return undefined;
}
