import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { fetchQuests, fetchUserQuests } from "@/lib/api/quests";
import { Quest, VerifyQuestResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import {
    useClaimQuestMutation,
    useVerifyQuestMutation,
} from "@/hooks/useQuestMutations";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";

export function useQuests() {
    const { address, isConnected } = useAccount();
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
        queryKey: ["quests", address],
        queryFn: async () => {
            if (isConnected && address) {
                return fetchUserQuests(address, fid);
            }
            return fetchQuests();
        },
        enabled: true,
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
                });
                return result;
            } catch (err) {
                throw err;
            } finally {
                setClaimingQuest(null);
            }
        },
        [address, claimMutate, fid]
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
