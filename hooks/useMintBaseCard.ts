"use client";

import {
    createBaseCard,
    deleteBaseCard,
    CreateBaseCardParams,
} from "@/lib/api/basecards";
import { baseCardAbi } from "@/lib/abi/abi";
import { useCallback, useState } from "react";
import { useContractConfig } from "@/hooks/useContractConfig";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { logger } from "@/lib/common/logger";

export function useMintBaseCard() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const { contractAddress } = useContractConfig();
    const publicClient = usePublicClient();
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

                if (!publicClient) {
                    throw new Error("Wallet not connected");
                }

                if (!contractAddress) {
                    throw new Error("Contract address not found");
                }

                const { request } = await publicClient.simulateContract({
                    address: contractAddress as `0x${string}`,
                    abi: baseCardAbi,
                    functionName: "mintBaseCard",
                    account: address,
                    args: [
                        // Encode CardData struct as tuple: [imageURI, nickname, role, bio]
                        [
                            card_data.imageUri,
                            card_data.nickname,
                            card_data.role,
                            card_data.bio || "",
                        ],
                        social_keys,
                        social_values,
                    ],
                });
                logger.info("✅ Simulation successful", request);

                const hash = await writeContractAsync(request);

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
        [address, writeContractAsync, publicClient, contractAddress]
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
