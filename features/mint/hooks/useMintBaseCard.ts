"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useConfig } from "@/hooks/api/useConfig";
import { baseCardAbi } from "@/lib/abi/abi";
import {
    createBaseCard,
    CreateBaseCardParams,
    deleteBaseCard,
    fetchCardByAddress,
} from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

export function useMintBaseCard() {
    const { address } = useAccount();
    const { accessToken, isAuthenticated } = useAuth();
    const { writeContractAsync } = useWriteContract();
    const { contractAddress } = useConfig();
    const [isCreatingBaseCard, setIsCreatingBaseCard] = useState(false);
    const [isSendingTransaction, setIsSendingTransaction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mintCard = useCallback(
        async (input: CreateBaseCardParams) => {
            setIsCreatingBaseCard(false);
            setIsSendingTransaction(false);
            setError(null);

            if (!isAuthenticated || !accessToken) {
                setError("Please login first");
                return { success: false, error: "Not authenticated" };
            }

            try {
                // 1. Backend API 호출: BaseCard 데이터 생성
                logger.info("Step 1: Creating BaseCard via Backend API...");
                setIsCreatingBaseCard(true);

                const { card_data, social_keys, social_values } =
                    await createBaseCard(address!, input, accessToken);

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: NFT 민팅 트랜잭션 전송
                logger.info("Step 2: Sending mint transaction...");
                setIsSendingTransaction(true);

                const hash = await writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: baseCardAbi,
                    functionName: "mintBaseCard",
                    args: [
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
                    deleteBaseCard(address!, accessToken).catch(logger.warn);
                    // Don't set error for user rejection - it's intentional
                    return { success: false, error: "User rejected" };
                }

                // AlreadyMinted - 이미 카드가 있는 경우
                if (rawMessage.includes("AlreadyMinted")) {
                    logger.info(
                        "User already has a card, fetching existing card..."
                    );
                    try {
                        const card = await fetchCardByAddress(accessToken);
                        if (card?.txHash) {
                            return {
                                success: true,
                                hash: card.txHash,
                                imageUri: card.imageUri || "",
                                isExisting: true,
                            };
                        }
                    } catch {
                        // 서버 확인 실패
                    }
                    return { success: false, error: "Already minted" };
                }

                // RPC 에러 등 - 서버에서 민팅 상태 확인
                logger.warn(
                    "Transaction may have succeeded despite error, checking server..."
                );
                try {
                    const card = await fetchCardByAddress(accessToken);
                    if (card?.txHash) {
                        logger.info(
                            "✅ Mint confirmed via server. Hash:",
                            card.txHash
                        );
                        return {
                            success: true,
                            hash: card.txHash,
                            imageUri: card.imageUri || "",
                        };
                    }
                } catch {
                    // Other errors
                }
                logger.error("❌ Mint error:", err);
                return {
                    success: false,
                    error: "Failed to mint. Please try again.",
                };
            }
        },
        [
            address,
            accessToken,
            writeContractAsync,
            contractAddress,
            isAuthenticated,
        ]
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
