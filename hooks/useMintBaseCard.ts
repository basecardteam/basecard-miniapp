"use client";

import {
    createBaseCard,
    deleteBaseCard,
    CreateBaseCardParams,
} from "@/lib/api/basecards";
import { ensureCorrectNetwork } from "@/lib/network";
import { baseCardAbi } from "@/lib/abi/abi";
import { activeChain } from "@/lib/wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { decodeErrorResult } from "viem";
import {
    useChainId,
    usePublicClient,
    useSwitchChain,
    useWriteContract,
    useAccount,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { BASECARD_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { REQUIRED_CHAIN_ID } from "@/lib/constants/chainId";
import { logger } from "@/lib/common/logger";

/**
 * BaseCard NFT 민팅을 위한 Hook
 */
export function useMintBaseCard() {
    const { address, isConnected } = useAccount();
    const [mintError, setMintError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // Used for API call status
    const [isSaving, setIsSaving] = useState(false); // Not used anymore but kept for compatibility if needed
    const { switchChainAsync } = useSwitchChain();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const queryClient = useQueryClient();

    const isCorrectChain = chainId === REQUIRED_CHAIN_ID;
    /**
     * Ensure user is on the correct network
     */
    const ensureNetwork = useCallback(async () => {
        await ensureCorrectNetwork(publicClient!, switchChainAsync!);
    }, [publicClient, switchChainAsync]);

    /**
     * Complete minting flow
     */
    const mintCard = useCallback(
        async (input: CreateBaseCardParams) => {
            setMintError(null);
            setIsPending(false);
            setIsConfirming(false);
            setIsGenerating(false);
            setIsSaving(false);

            try {
                // 1. Network Check
                await ensureNetwork();

                // 2. Create Card (Backend)
                console.log("🎨 Creating card via Backend...");
                setIsGenerating(true);

                const { card_data, social_keys, social_values } =
                    await createBaseCard(input);

                setIsGenerating(false);

                // 3. Final Network Check
                await ensureNetwork();

                // 4. Mint NFT
                console.log("🎨 Minting NFT...");
                setIsPending(true);

                if (!writeContractAsync)
                    throw new Error("Wallet not connected");

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

                const explorerUrl = `https://sepolia.basescan.org/tx/${hash}`;
                console.log("🔗 Explorer Link:", explorerUrl);

                setIsPending(false);
                setIsConfirming(false); // No longer waiting for confirmation

                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["myBaseCard"] });

                return { success: true, hash };
            } catch (error) {
                console.error("❌ Mint error:", error);
                setIsPending(false);
                setIsConfirming(false);
                setIsGenerating(false);
                setIsSaving(false);

                let errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to mint BaseCard";

                // Decode contract error if present
                if (error instanceof Error) {
                    const errorObj = error as any;
                    const errorData =
                        errorObj?.data ||
                        errorObj?.cause?.data ||
                        errorObj?.shortMessage?.match(
                            /data="(0x[a-fA-F0-9]+)"/
                        )?.[1];

                    if (errorData?.startsWith("0x")) {
                        try {
                            const decoded = decodeErrorResult({
                                abi: baseCardAbi,
                                data: errorData,
                            });
                            if (decoded.errorName === "AlreadyMinted") {
                                errorMessage = "Already minted";
                            } else {
                                errorMessage = `Contract error: ${decoded.errorName}`;
                            }
                        } catch {}
                    }
                }

                // Cleanup DB if needed
                if (errorMessage.includes("User rejected the request")) {
                    deleteBaseCard(input.address).catch(console.warn);
                }

                setMintError(errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        [ensureNetwork, writeContractAsync, publicClient]
    );

    return {
        mintCard,
        isPending,
        isConfirming,
        isGenerating,
        error: mintError,
        isCorrectChain,
        chainId,
        requiredChainId: REQUIRED_CHAIN_ID,
        chainName: activeChain.name,
    };
}
