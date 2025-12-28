import { useAuth } from "@/components/providers/AuthProvider";
import { claimQuest, fetchUserQuests } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Quest Data & API Hook
 *
 * 역할: 순수 데이터 fetching + API 호출
 * - quests 데이터 fetch
 * - claim/verify API 호출
 */
export function useMyQuests() {
    const { accessToken, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { address } = useAccount();

    // UI 상태 (API 호출 중)
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);

    // ===========================================
    // Data Fetching
    // ===========================================
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
        staleTime: 0,
    });

    // ===========================================
    // Claim Quest
    // ===========================================
    const claim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!isAuthenticated || !accessToken || !address) {
                throw new Error("Please sign in to claim quests");
            }

            setClaimingQuest(quest.actionType);

            try {
                const result = await claimQuest(quest.id, accessToken, address);

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

    // ===========================================
    // Return
    // ===========================================
    return {
        // Data
        quests: quests || [],
        isLoading,
        isAuthenticated,
        error: error ? (error as Error).message : null,

        // UI State
        claimingQuest,
        claim,
        refetch,
    };
}
