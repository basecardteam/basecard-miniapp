import { useConfig } from "@/hooks/api/useConfig";
import baseCardAbi from "@/lib/abi/BaseCard.json";
import { logger } from "@/lib/common/logger";
import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";

export interface SocialLink {
    key: string;
    value: string;
}

export interface BaseCardMetadata {
    name: string;
    image: string;
    nickname: string;
    role: string;
    bio: string;
    socials: SocialLink[];
}

/**
 * Hook to check if the current user has minted a BaseCard
 * and optionally fetch its metadata (including socials).
 */
export function useERC721Token() {
    const { address } = useAccount();
    const { contractAddress } = useConfig();

    logger.debug(`contract address: ${contractAddress}`);

    const {
        data: tokenIdData,
        isLoading: isLoadingTokenId,
        error: errorTokenId,
        refetch: refetchTokenId,
    } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: baseCardAbi.abi,
        functionName: "tokenIdOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!contractAddress,
        },
    });

    const tokenId = tokenIdData ? BigInt(tokenIdData as any) : undefined;
    const hasMinted = !!tokenId && tokenId > BigInt(0);

    // Fetch tokenURI if minted
    const {
        data: tokenURI,
        isLoading: isLoadingTokenURI,
        error: errorTokenURI,
        refetch: refetchTokenURI,
    } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: baseCardAbi.abi,
        functionName: "tokenURI",
        args: hasMinted && tokenId ? [tokenId] : undefined,
        query: {
            enabled: hasMinted && !!contractAddress,
        },
    });

    const metadata = useMemo(() => {
        if (!tokenURI) return null;
        try {
            const base64Data = (tokenURI as string).replace(
                "data:application/json;base64,",
                ""
            );
            const jsonString = atob(base64Data);
            return JSON.parse(jsonString) as BaseCardMetadata;
        } catch (error) {
            console.error("Failed to parse tokenURI:", error);
            return null;
        }
    }, [tokenURI]);

    logger.debug(
        `hasMinted: ${hasMinted}, tokenId: ${tokenId}, metadata: ${JSON.stringify(
            metadata
        )}`
    );

    return {
        hasMinted,
        tokenId,
        metadata,
        isLoading: isLoadingTokenId || isLoadingTokenURI,
        error: errorTokenId || errorTokenURI,
        refetch: () => {
            refetchTokenId();
            refetchTokenURI();
        },
    };
}
