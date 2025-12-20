"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useConfig } from "@/hooks/useConfig";
import { useERC721Token } from "@/hooks/useERC721Token";
import { baseCardAbi } from "@/lib/abi/abi";
import {
    rollbackUpdate,
    updateBaseCard,
    UpdateBaseCardParams,
} from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

export function useEditBaseCard() {
    const { address } = useAccount();
    const { accessToken } = useAuth();
    const { writeContractAsync } = useWriteContract();
    const { contractAddress } = useConfig();
    const publicClient = usePublicClient();
    const { tokenId } = useERC721Token();

    const [isCreatingBaseCard, setIsCreatingBaseCard] = useState(false);
    const [isSendingTransaction, setIsSendingTransaction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editCard = useCallback(
        async (input: UpdateBaseCardParams) => {
            setIsCreatingBaseCard(false);
            setIsSendingTransaction(false);
            setError(null);

            let uploadedFiles: { s3Key: string; ipfsId: string } | undefined;

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
                    accessToken || undefined
                );
                const { card_data, social_keys, social_values } = response;
                uploadedFiles = response.uploadedFiles;

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: editBaseCard 트랜잭션 전송
                logger.info("Step 2: Sending editBaseCard transaction...");
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
                    functionName: "editBaseCard",
                    account: address,
                    args: [
                        BigInt(tokenId),
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

                // Rollback if files were uploaded but transaction failed/rejected
                if (uploadedFiles && address) {
                    logger.info("↺ Rolling back uploaded files...");
                    rollbackUpdate(
                        address,
                        uploadedFiles,
                        accessToken || undefined
                    ).catch((rollbackErr) => {
                        logger.error("Failed to rollback:", rollbackErr);
                    });
                }

                // User rejected the transaction
                if (rawMessage.includes("User rejected")) {
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
            publicClient,
            contractAddress,
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
