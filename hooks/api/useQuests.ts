import { useAuth } from "@/components/providers/AuthProvider";
import { useClaimQuestMutation } from "@/hooks/useQuestMutations";
import { fetchActiveQuests, fetchUserQuests } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

export function useQuests() {
    const { accessToken, isAuthenticated } = useAuth();
    const { address } = useAccount();
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);

    // User quests (authenticated) - fetch user's quest progress
    const {
        data: userQuests,
        isLoading: isUserQuestsLoading,
        error: userQuestsError,
        refetch: refetchUserQuests,
    } = useQuery({
        queryKey: ["userQuests", accessToken],
        queryFn: async () => {
            if (!accessToken) return [];
            return fetchUserQuests(accessToken);
        },
        enabled: isAuthenticated && !!accessToken,
        staleTime: 1000 * 60, // 1 minute
    });

    // Active quests (public) - for unauthenticated users
    const {
        data: activeQuests,
        isLoading: isActiveQuestsLoading,
        error: activeQuestsError,
    } = useQuery({
        queryKey: ["activeQuests"],
        queryFn: fetchActiveQuests,
        enabled: !isAuthenticated, // Only fetch when NOT authenticated
        staleTime: 1000 * 60, // 1 minute
    });

    // Use user quests if authenticated, otherwise use active quests
    const quests = isAuthenticated ? userQuests || [] : activeQuests || [];
    const isLoading = isAuthenticated
        ? isUserQuestsLoading
        : isActiveQuestsLoading;
    const error = isAuthenticated ? userQuestsError : activeQuestsError;

    // Mutations
    const { mutateAsync: claimMutate } = useClaimQuestMutation();

    const handleClaim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!isAuthenticated || !accessToken || !address) {
                throw new Error("Please sign in to claim quests");
            }

            setClaimingQuest(quest.actionType);

            try {
                const result = await claimMutate({
                    questId: quest.id,
                    accessToken,
                    address,
                });
                return result;
            } catch (err) {
                throw err;
            } finally {
                setClaimingQuest(null);
            }
        },
        [claimMutate, accessToken, isAuthenticated, address]
    );

    return {
        quests,
        isLoading,
        isAuthenticated,
        // error object format normalization
        error: error ? (error as Error).message : null,
        claimingQuest,
        claim: handleClaim,
        refetch: refetchUserQuests,
    };
}
