"use client";

import { baseCardAbi } from "@/lib/abi/abi";
import { BASECARD_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { useAccount, useReadContract } from "wagmi";
import { useMemo } from "react";

/**
 * On-chain BaseCard data structure matching the contract's CardData struct
 */
export interface OnChainCardData {
    imageURI: string;
    nickname: string;
    role: string;
    bio: string;
}

/**
 * Parsed metadata from tokenURI
 */
export interface BaseCardMetadata {
    name: string;
    image: string;
    nickname: string;
    role: string;
    bio: string;
    socials: Array<{ key: string; value: string }>;
}

/**
 * Result type for the hook
 */
export interface UseOnChainBaseCardResult {
    /** Whether the user has minted a card */
    hasMinted: boolean | undefined;
    /** The token ID of the user's card (0 if not minted) */
    tokenId: bigint | undefined;
    /** Parsed metadata from tokenURI */
    metadata: BaseCardMetadata | null;
    /** Raw tokenURI string */
    tokenURI: string | undefined;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Refetch function */
    refetch: () => void;
}

/**
 * Parse base64 encoded JSON metadata from tokenURI
 */
function parseTokenURI(tokenURI: string): BaseCardMetadata | null {
    try {
        // Remove the data:application/json;base64, prefix
        const base64Data = tokenURI.replace(
            "data:application/json;base64,",
            ""
        );
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse tokenURI:", error);
        return null;
    }
}

/**
 * Custom hook to fetch the user's minted BaseCard directly from the contract.
 *
 * This hook:
 * 1. Gets the tokenId using `tokenIdOf(address)` (0 if not minted)
 * 2. If tokenId > 0, fetches the tokenURI and parses the metadata
 *
 * @example
 * ```tsx
 * const { hasMinted, metadata, isLoading } = useOnChainBaseCard();
 *
 * if (isLoading) return <Loading />;
 * if (!hasMinted) return <MintPrompt />;
 * return <CardDisplay metadata={metadata} />;
 * ```
 */
export function useOnChainBaseCard(): UseOnChainBaseCardResult {
    const { address, isConnected } = useAccount();

    // 1. Get tokenId directly using tokenIdOf(address)
    // Returns 0 if not minted, otherwise returns the tokenId
    const {
        data: tokenIdData,
        isLoading: isLoadingTokenId,
        error: tokenIdError,
        refetch: refetchTokenId,
    } = useReadContract({
        address: BASECARD_CONTRACT_ADDRESS,
        abi: baseCardAbi,
        functionName: "tokenIdOf",
        args: address ? [address] : undefined,
        query: {
            enabled: isConnected && !!address,
        },
    });

    // Determine if user has minted (tokenId > 0)
    const tokenId = tokenIdData as bigint | undefined;
    const hasMinted = tokenId !== undefined ? tokenId > BigInt(0) : undefined;
    const validTokenId = tokenId && tokenId > BigInt(0) ? tokenId : undefined;

    // 2. Fetch tokenURI for the user's token
    const {
        data: tokenURIData,
        isLoading: isLoadingTokenURI,
        error: tokenURIError,
        refetch: refetchTokenURI,
    } = useReadContract({
        address: BASECARD_CONTRACT_ADDRESS,
        abi: baseCardAbi,
        functionName: "tokenURI",
        args: validTokenId ? [validTokenId] : undefined,
        query: {
            enabled: !!validTokenId,
        },
    });

    // Parse metadata from tokenURI
    const metadata = useMemo(() => {
        if (!tokenURIData) return null;
        return parseTokenURI(tokenURIData as string);
    }, [tokenURIData]);

    // Combined loading state
    const isLoading = isLoadingTokenId || isLoadingTokenURI;

    // Combined error
    const error = tokenIdError || tokenURIError || null;

    // Combined refetch
    const refetch = () => {
        refetchTokenId();
        refetchTokenURI();
    };

    return {
        hasMinted,
        tokenId: validTokenId,
        metadata,
        tokenURI: tokenURIData as string | undefined,
        isLoading,
        error: error as Error | null,
        refetch,
    };
}
