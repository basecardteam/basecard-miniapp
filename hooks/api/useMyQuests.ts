import { useAuth } from "@/components/providers/AuthProvider";
import { claimQuest, fetchUserQuests } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Hook for authenticated user's quest progress
 */
export function useMyQuests() {
    const { accessToken, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);
    const {address} = useAccount();
    const {
        data: quests,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["userQuests", accessToken],
        queryFn: async () => {
            if (!accessToken) return [];
            return fetchUserQuests(accessToken);
        },
        enabled: isAuthenticated && !!accessToken,
        staleTime: 1000 * 60, // 1 minute
    });

    const claim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!isAuthenticated || !accessToken || !address)  {
                throw new Error("Please sign in to claim quests");
            }

            setClaimingQuest(quest.actionType);

            try {
                const result = await claimQuest(quest.id, accessToken, address);

                // Invalidate queries on success
                if (result.verified) {
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ["userQuests"],
                        }),
                        queryClient.invalidateQueries({ queryKey: ["user"] }),
                    ]);
                }

                return result;
            } finally {
                setClaimingQuest(null);
            }
        },
        [accessToken, isAuthenticated, queryClient, address]
    );

    return {
        quests: quests || [],
        isLoading,
        isAuthenticated,
        error: error ? (error as Error).message : null,
        claimingQuest,
        claim,
        refetch,
    };
}
