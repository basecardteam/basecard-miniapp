import { useAuth } from "@/components/providers/AuthProvider";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { useClaimQuestMutation } from "@/hooks/useQuestMutations";
import { fetchQuests, fetchUserQuests } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

export function useQuests() {
    const { address, isConnected } = useAccount();
    const { accessToken, isAuthenticated } = useAuth();
    const frameContext = useFrameContext();
    const fid = (frameContext?.context as MiniAppContext)?.user?.fid;
    const [claimingQuest, setClaimingQuest] = useState<string | null>(null);

    // Queries
    const {
        data: quests = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["quests", address, accessToken],
        queryFn: async () => {
            if (!accessToken) return [];
            if (isConnected && address) {
                return fetchUserQuests(address, fid, accessToken);
            }
            return fetchQuests(accessToken);
        },
        enabled: isAuthenticated && !!accessToken, // Only fetch when authenticated AND token available
        staleTime: 1000 * 60, // 1 minute
    });

    // Mutations
    const { mutateAsync: claimMutate } = useClaimQuestMutation();

    const handleClaim = useCallback(
        async (quest: Quest): Promise<VerifyQuestResponse | null> => {
            if (!address) {
                throw new Error("Please connect your wallet first");
            }

            setClaimingQuest(quest.actionType);

            try {
                const result = await claimMutate({
                    address,
                    questId: quest.id,
                    fid,
                    accessToken: accessToken || undefined,
                });
                return result;
            } catch (err) {
                throw err;
            } finally {
                setClaimingQuest(null);
            }
        },
        [address, claimMutate, fid, accessToken]
    );

    return {
        quests,
        isLoading,
        // error object format normalization
        error: error ? (error as Error).message : null,
        claimingQuest,
        claim: handleClaim,
        refetch,
    };
}
