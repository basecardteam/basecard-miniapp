"use client";

import {
    createBaseCard,
    deleteBaseCard,
    CreateBaseCardParams,
} from "@/lib/api/basecards";
import { baseCardAbi } from "@/lib/abi/abi";
import { useCallback, useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { BASECARD_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { logger } from "@/lib/common/logger";

export function useMintBaseCard() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isCreatingBaseCard, setIsCreatingBaseCard] = useState(false);
    const [isSendingTransaction, setIsSendingTransaction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mintCard = useCallback(
        async (input: CreateBaseCardParams) => {
            setIsCreatingBaseCard(false);
            setIsSendingTransaction(false);
            setError(null);

            try {
                // 1. Backend API 호출: BaseCard 데이터 생성
                logger.info("Step 1: Creating BaseCard via Backend API...");
                setIsCreatingBaseCard(true);

                const { card_data, social_keys, social_values } =
                    await createBaseCard(address!, input);

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: NFT 민팅 트랜잭션 전송
                logger.info("Step 2: Sending mint transaction...");
                setIsSendingTransaction(true);

                const hash = await writeContractAsync({
                    address: BASECARD_CONTRACT_ADDRESS,
                    abi: baseCardAbi,
                    functionName: "mintBaseCard",
                    args: [
                        {
                            imageURI: card_data.imageUri,
                            nickname: card_data.nickname,
                            role: card_data.role,
                            bio: card_data.bio || "",
                        },
                        social_keys,
                        social_values,
                    ],
                });

                logger.info("✅ Transaction sent. Hash:", hash);
                setIsSendingTransaction(false);

                return {
                    success: true,
                    hash,
                    imageUri: card_data.imageUri,
                };
            } catch (err) {
                // Reset loading states
                setIsCreatingBaseCard(false);
                setIsSendingTransaction(false);

                const rawMessage =
                    err instanceof Error ? err.message : String(err);

                logger.debug(rawMessage);

                // User rejected the transaction
                if (rawMessage.includes("User rejected")) {
                    deleteBaseCard(address!).catch(logger.warn);
                    // Don't set error for user rejection - it's intentional
                    return { success: false, error: "User rejected" };
                }

                // Already minted error
                if (rawMessage.includes("AlreadyMinted")) {
                    return { success: false, error: "Already minted" };
                }

                // Other errors
                logger.error("❌ Mint error:", err);
                return {
                    success: false,
                    error: "Failed to mint. Please try again.",
                };
            }
        },
        [address, writeContractAsync]
    );

    return {
        mintCard,
        // Loading states
        isCreatingBaseCard,
        isSendingTransaction,
        // Error
        error,
    };
}
