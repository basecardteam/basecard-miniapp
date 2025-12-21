"use client";

import { useContractConfig } from "@/hooks/useContractConfig";
import { useERC721Token } from "@/hooks/useERC721Token";
import { baseCardAbi } from "@/lib/abi/abi";
import {
    rollbackUpdate,
    updateBaseCard,
    UpdateBaseCardParams,
} from "@/lib/api/basecards";
import { logger } from "@/lib/common/logger";
import { useQueryClient } from "@tanstack/react-query";
import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { useCallback, useState } from "react";
import { useAccount, useConfig } from "wagmi";

export function useEditBaseCard() {
    const { address } = useAccount();
    const config = useConfig();
    const queryClient = useQueryClient();
    const { contractAddress } = useContractConfig();
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

                const response = await updateBaseCard(address, input);
                const { card_data, social_keys, social_values } = response;
                uploadedFiles = response.uploadedFiles;

                setIsCreatingBaseCard(false);

                // 2. Contract 호출: editBaseCard 트랜잭션 전송
                logger.info("Step 2: Sending editBaseCard transaction...");
                setIsSendingTransaction(true);

                if (!contractAddress) {
                    throw new Error("Contract address not found");
                }

                // Simulate first
                const { request } = await simulateContract(config, {
                    address: contractAddress as `0x${string}`,
                    abi: baseCardAbi,
                    functionName: "editBaseCard",
                    account: address,
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
                logger.info("✅ Simulation successful", request);

                // writeContract from @wagmi/core
                const hash = await writeContract(config, request);
                logger.info("✅ Transaction sent. Hash:", hash);

                // 블록체인 확인 대기
                logger.info("⏳ Waiting for transaction confirmation...");
                const receipt = await waitForTransactionReceipt(config, { hash });

                if (receipt.status !== "success") {
                    throw new Error("Transaction failed on chain");
                }
                logger.info("✅ Transaction confirmed!", receipt);

                // 백엔드가 블록체인 이벤트를 처리할 시간 대기
                logger.info("⏳ Waiting for backend to process event...");
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Invalidate and refetch myBaseCard query
                await queryClient.invalidateQueries({ queryKey: ["myBaseCard", address] });
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


                // RPC 에러 등 - 서버에서 업데이트 상태 확인 (딜레이 후 재시도)
                logger.warn(
                    "Transaction may have succeeded despite error, checking server..."
                );

                // Rollback if files were uploaded but transaction failed/rejected
                if (uploadedFiles && address) {
                    logger.info("↺ Rolling back uploaded files...");
                    rollbackUpdate(address, uploadedFiles).catch(
                        (rollbackErr) => {
                            logger.error("Failed to rollback:", rollbackErr);
                        }
                    );
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
        [address, tokenId, config, contractAddress, queryClient, ]
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
