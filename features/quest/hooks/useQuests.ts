import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { fetchQuests, fetchUserQuests, claimQuest } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useERC721Token } from "@/hooks/useERC721Token";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useQuests() {
    const { address, isConnected } = useAccount();
    const queryClient = useQueryClient();
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);

    const { hasMinted, metadata } = useERC721Token();

    const {
        data: quests = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["quests", address],
        queryFn: async () => {
            if (isConnected && address) {
                return fetchUserQuests(address);
            }
            return fetchQuests();
        },
        enabled: true,
        staleTime: 1000 * 60, // 1 minute
    });

    // Derive computed quests with client-side status overrides
    const computedQuests = useMemo(() => {
        return quests.map((quest) => {
            // If already completed or explicitly claimable, keep it
            if (quest.status === "completed" || quest.status === "claimable") {
                return quest;
            }

            let isClaimable = false;

            if (quest.actionType === "MINT") {
                isClaimable = !!hasMinted;
            } else if (quest.actionType === "LINK_BASENAME") {
                isClaimable = !!hasMinted && !!metadata?.nickname;
            } else if (quest.actionType === "LINK_SOCIAL") {
                if (hasMinted && metadata?.socials) {
                    const title = quest.title.toLowerCase();
                    // Map title keywords to social keys
                    if (title.includes("twitter") || title.includes(" x ")) {
                        isClaimable = metadata.socials.some(
                            (s) => s.key === "x" || s.key === "twitter"
                        );
                    } else if (title.includes("instagram")) {
                        isClaimable = metadata.socials.some(
                            (s) => s.key === "instagram"
                        );
                    } else if (title.includes("github")) {
                        isClaimable = metadata.socials.some(
                            (s) => s.key === "github"
                        );
                    } else if (
                        title.includes("farcaster") ||
                        title.includes("warpcast")
                    ) {
                        isClaimable = metadata.socials.some(
                            (s) => s.key === "farcaster"
                        );
                    } else {
                        // Fallback generic check
                        isClaimable = metadata.socials.length > 0;
                    }
                }
            }

            if (isClaimable) {
                return { ...quest, status: "claimable" as const };
            }
            return quest;
        });
    }, [quests, hasMinted, metadata]);

    const handleClaim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!address) {
                throw new Error("Please connect your wallet first");
            }

            setClaimingQuest(quest.actionType);

            try {
                const result = await claimQuest(address, quest.id);

                if (result.verified) {
                    // Update both quests and user points
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ["quests", address],
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ["user", address],
                        }),
                    ]);
                }

                return result;
            } catch (err) {
                throw err;
            } finally {
                setClaimingQuest(null);
            }
        },
        [address, queryClient]
    );

    return {
        quests: computedQuests,
        isLoading,
        // error object format normalization
        error: error ? (error as Error).message : null,
        claimingQuest,
        claim: handleClaim,
        refetch,
    };
}
