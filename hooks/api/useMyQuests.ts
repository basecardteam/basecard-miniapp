import { useAuth } from "@/components/providers/AuthProvider";
import {
    claimQuest,
    fetchUserQuests,
    verifyQuestByAction,
} from "@/lib/api/quests";
import {
    clearPendingAction,
    getPendingActionTypes,
    setPendingAction,
} from "@/lib/quest/questPendingActions";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Hook for authenticated user's quest progress
 * Includes pending action management and visibility API integration
 */
export function useMyQuests() {
    const { accessToken, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);
    const [verifyingActions, setVerifyingActions] = useState<string[]>([]);
    const { address } = useAccount();

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

    // Mark action as pending when user clicks external link
    const markPendingAction = useCallback((actionType: string) => {
        setPendingAction(actionType);
    }, []);

    // Verify a specific pending action
    const verifyAction = useCallback(
        async (actionType: string): Promise<VerifyQuestResponse | null> => {
            if (!accessToken) return null;

            setVerifyingActions((prev) => [...prev, actionType]);

            try {
                const result = await verifyQuestByAction(
                    actionType,
                    accessToken
                );

                // Clear from pending on success
                clearPendingAction(actionType);

                // Invalidate queries to refresh status
                if (result.verified) {
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ["userQuests"],
                        }),
                        queryClient.invalidateQueries({ queryKey: ["user"] }),
                    ]);
                }

                return result;
            } catch (error) {
                console.error("Failed to verify action:", actionType, error);
                return null;
            } finally {
                setVerifyingActions((prev) =>
                    prev.filter((a) => a !== actionType)
                );
            }
        },
        [accessToken, queryClient]
    );

    // Verify all pending actions (called on visibility change)
    const verifyPendingActions = useCallback(async () => {
        if (!accessToken) return;

        const pendingTypes = getPendingActionTypes();
        if (pendingTypes.length === 0) return;

        // Verify each pending action
        await Promise.all(
            pendingTypes.map((actionType) => verifyAction(actionType))
        );
    }, [accessToken, verifyAction]);

    // Visibility API - detect when user returns to app
    useEffect(() => {
        if (typeof document === "undefined") return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // User returned to the app - verify pending actions
                verifyPendingActions();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [verifyPendingActions]);

    // Also verify on initial mount if there are pending actions
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            verifyPendingActions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, accessToken]);

    const claim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!isAuthenticated || !accessToken || !address) {
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
        verifyingActions,
        claim,
        refetch,
        markPendingAction,
        verifyAction,
        verifyPendingActions,
    };
}
