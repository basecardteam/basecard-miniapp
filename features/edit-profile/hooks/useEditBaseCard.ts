"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useConfig } from "@/hooks/api/useConfig";
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

            let imageUri = "";
            let needsRollback = false;
            try {
                // 1. Backend API 호출
                logger.info("Step 1: Preparing update via Backend API...");
                setIsCreatingBaseCard(true);

                const {
                    card_data,
                    social_keys,
                    social_values,
                    token_id,
                    needs_rollback,
                } = await updateBaseCard(input, accessToken);

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: editBaseCard 트랜잭션 전송
                logger.info("Step 2: Sending editBaseCard transaction...");
                setIsSendingTransaction(true);

                imageUri = card_data.imageUri;
                needsRollback = needs_rollback;

                const hash = await writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: baseCardAbi,
                    functionName: "editBaseCard",
                    args: [
                        BigInt(token_id),
                        [
                            card_data.imageUri,
                            card_data.nickname,
                            card_data.role,
                            card_data.bio,
                        ],
                        social_keys,
                        social_values,
                    ],
                });

                logger.info("✅ Transaction sent. Hash:", hash);
                setIsSendingTransaction(false);

                // Invalidate and refetch myBaseCard query + userQuests (profile changes may complete quests)
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["myBaseCard", address],
                    }),
                    queryClient.invalidateQueries({ queryKey: ["userQuests"] }),
                ]);
                await queryClient.refetchQueries({
                    queryKey: ["myBaseCard", address],
                });

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

                // Rollback IPFS upload if files were uploaded (for any error)
                if (needsRollback && imageUri) {
                    logger.info("Rolling back uploaded IPFS files...");
                    rollbackUpdate(imageUri, accessToken).catch(
                        (rollbackErr: unknown) => {
                            logger.error("Failed to rollback:", rollbackErr);
                        }
                    );
                }

                // User rejected the transaction - don't show error
                if (rawMessage.includes("User rejected")) {
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
