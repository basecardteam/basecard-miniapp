"use client";

import {
    createBaseCard,
    updateCardTokenId,
    CreateBaseCardParams,
} from "@/lib/api/basecards";
import { BACKEND_API_URL } from "@/lib/common/config";
import { extractTokenIdFromReceipt } from "@/lib/contracts/utils";
import { ensureCorrectNetwork } from "@/lib/utils/network";
import { baseCardAbi } from "@/lib/abi/abi";
import { activeChain } from "@/lib/wagmi";
import { walletAddressAtom } from "@/store/walletState";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { decodeErrorResult, decodeEventLog } from "viem";
import {
    useAccount,
    useChainId,
    usePublicClient,
    useReadContract,
    useSwitchChain,
    useWriteContract,
} from "wagmi";
import { BASECARD_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { REQUIRED_CHAIN_ID } from "@/lib/constants/chainId";

/**
 * BaseCard NFT 민팅을 위한 Hook
 */
export function useMintBaseCard() {
    const [userAddress] = useAtom(walletAddressAtom);
    const [mintError, setMintError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // Used for API call status
    const [isSaving, setIsSaving] = useState(false); // Not used anymore but kept for compatibility if needed

    // Get current chain ID
    const chainId = useChainId();
    const isCorrectChain = chainId === REQUIRED_CHAIN_ID;

    // Get public client for waiting transaction receipt
    const publicClient = usePublicClient();

    // Switch chain hook for network switching
    const { switchChainAsync } = useSwitchChain();

    // writeContract hook for sending transaction
    const { writeContractAsync } = useWriteContract();

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

                console.log("✅ Transaction sent. Hash:", hash);
                setIsPending(false);
                setIsConfirming(true);

                // 5. Wait for Receipt
                if (!publicClient) throw new Error("Public client unavailable");

                const receipt = await publicClient.waitForTransactionReceipt({
                    hash,
                });
                const tokenId = extractTokenIdFromReceipt(receipt);

                if (!tokenId) throw new Error("Failed to extract tokenId");

                // 6. Update DB
                await updateCardTokenId(input.address, Number(tokenId));

                setIsConfirming(false);
                return { success: true, hash, tokenId };
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
                if (!errorMessage.includes("rejected") && input.address) {
                    fetch(`${BACKEND_API_URL}/v1/cards/card/${input.address}`, {
                        method: "DELETE",
                    }).catch(console.warn);
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
