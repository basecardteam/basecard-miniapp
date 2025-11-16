import { useCallback, useEffect, useMemo, useState } from "react";
import { Abi, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

import BASECARD_NFT_ABI_FULL from "@/lib/abi/BaseCard.json";

const NFT_CONTRACT_ADDRESS = process.env
    .NEXT_PUBLIC_BASECARD_NFT_CONTRACT_ADDRESS! as `0x${string}`;
const abi = BASECARD_NFT_ABI_FULL.abi as Abi;

const DEFAULT_SOCIAL_KEYS = ["x", "farcaster", "github", "linkedin", "website"] as const;

type SocialKey = string;


interface UseBaseCardSocialsOptions {
    keys?: SocialKey[];
    enabled?: boolean;
}

interface BaseCardSocialsResult {
    socials: Record<string, string>;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useBaseCardSocials(
    tokenId: number | null,
    options: UseBaseCardSocialsOptions = {}
): BaseCardSocialsResult {
    const { keys = DEFAULT_SOCIAL_KEYS, enabled = true } = options;
    const publicClient = usePublicClient();

    const [socials, setSocials] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nonce, setNonce] = useState(0);

    const normalizedTokenId = useMemo(() => {
        if (!tokenId && tokenId !== 0) return undefined;

        try {
            if (typeof tokenId === "number") {
                return BigInt(tokenId);
            }

            return BigInt(tokenId);
        } catch {
            console.warn("Invalid tokenId:", tokenId);
            return undefined;
        }
    }, [tokenId]);

    const normalizedKeys = useMemo(() => {
        return Array.from(
            new Set(
                keys
                    .map((key) => key.trim())
                    .filter((key) => key.length > 0)
            )
        );
    }, [keys]);

    const fetchSocials = useCallback(async () => {
        if (!enabled || !normalizedTokenId) {
            setSocials({});
            setError(null);
            setIsLoading(false);
            return;
        }

        if (!publicClient) {
            setSocials({});
            setError(null);
            setIsLoading(false);
            return;
        }

        if (normalizedKeys.length === 0) {
            setSocials({});
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        const abiSocial = parseAbi([
            "function getSocial(uint256 _tokenId, string _key) view returns (string)",
        ]);

        try {
            console.log("normalizedTokenId", normalizedTokenId);
            const entries = await Promise.all(
                normalizedKeys.map(async (key) => {
                    try {
                        const value = (await publicClient?.readContract({
                            abi: abiSocial,
                            address: NFT_CONTRACT_ADDRESS,
                            functionName: "getSocial",
                            args: [normalizedTokenId, key],
                        })) as string;
                        return [key, value.trim()] as const;
                    } catch (readError) {
                        console.warn(`Failed to fetch social link for key "${key}"`, readError);
                        return [key, ""] as const;
                    }
                })
            );

            const filtered = entries.filter(([, value]) => value.length > 0);
            setSocials(Object.fromEntries(filtered));
        } catch (fetchError) {
            console.error("Failed to fetch BaseCard social links:", fetchError);
            // setSocialError(
            //     fetchError instanceof Error ? fetchError.message : "Failed to fetch social links"
            // );
            setSocials({});
        } finally {
            setIsLoading(false);
        }
    }, [tokenId]);

    useEffect(() => {
        if (!tokenId) return;

        fetchSocials();
    }, [fetchSocials, nonce]);

    return {
        socials,
        isLoading,
        error,
        refetch: () => setNonce((prev) => prev + 1),
    };
}