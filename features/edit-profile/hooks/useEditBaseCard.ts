"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useConfig } from "@/hooks/api/useConfig";
import { useERC721Token } from "@/hooks/evm/useERC721Token";
import { baseCardAbi } from "@/lib/abi/abi";
import {
    rollbackUpdate,
    updateBaseCard,
    UpdateBaseCardParams,
} from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

export function useEditBaseCard() {
    const { address } = useAccount();
    const { accessToken, isAuthenticated } = useAuth();
    const { writeContractAsync } = useWriteContract();
    const { contractAddress } = useConfig();
    const queryClient = useQueryClient();
    const { tokenId } = useERC721Token();

    const [isCreatingBaseCard, setIsCreatingBaseCard] = useState(false);
    const [isSendingTransaction, setIsSendingTransaction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editCard = useCallback(
        async (input: UpdateBaseCardParams) => {
            setIsCreatingBaseCard(false);
            setIsSendingTransaction(false);
            setError(null);

            if (!isAuthenticated || !accessToken) {
                setError("Please login first");
                return { success: false, error: "Not authenticated" };
            }

            if (!contractAddress) {
                setError("Contract address not found");
                return { success: false, error: "Contract address not found" };
            }

            let uploadedFiles: { ipfsId: string } | undefined;

            try {
                if (!address) {
                    throw new Error("Wallet not connected");
                }

                if (!tokenId) {
                    throw new Error("No BaseCard token found for this address");
                }

                // 1. Backend API 호출: 이미지 처리 (S3 + IPFS) - DB 업데이트 없음
                logger.info("Step 1: Preparing update via Backend API...");
                setIsCreatingBaseCard(true);

                const response = await updateBaseCard(
                    address,
                    input,
                    accessToken
                );
                const { card_data, social_keys, social_values } = response;
                uploadedFiles = response.uploadedFiles;

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: editBaseCard 트랜잭션 전송
                logger.info("Step 2: Sending editBaseCard transaction...");
                setIsSendingTransaction(true);

                if (!contractAddress) {
                    throw new Error("Contract address not found");
                }

                const hash = await writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: baseCardAbi,
                    functionName: "editBaseCard",
                    args: [
                        BigInt(tokenId),
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

                // Invalidate and refetch myBaseCard query + userQuests (profile changes may complete quests)
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["myBaseCard", address] }),
                    queryClient.invalidateQueries({ queryKey: ["userQuests"] }),
                ]);
                await queryClient.refetchQueries({ queryKey: ["myBaseCard", address] });

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
                    // Rollback IPFS upload if files were uploaded
                    if (uploadedFiles && address) {
                        logger.info("↺ Rolling back uploaded IPFS files...");
                        rollbackUpdate(
                            address,
                            uploadedFiles,
                            accessToken
                        ).catch((rollbackErr: unknown) => {
                            logger.error("Failed to rollback:", rollbackErr);
                        });
                    }
                    // Don't set error for user rejection - it's intentional
                    return { success: false, error: "User rejected" };
                }

                // Other errors
                logger.error("❌ Edit error:", err);
                setError(rawMessage);
                return {
                    success: false,
                    error: rawMessage || "Failed to update. Please try again.",
                };
            }
        },
        [
            address,
            accessToken,
            tokenId,
            writeContractAsync,
            contractAddress,
            isAuthenticated,
            queryClient,
        ]
    );

    return {
        editCard,
        // Loading states (same naming as useMintBaseCard)
        isCreatingBaseCard,
        isSendingTransaction,
        // Error
        error,
    };
}
