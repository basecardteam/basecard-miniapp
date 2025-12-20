import { claimQuest, verifyQuest } from "@/lib/api/quests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClaimQuestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            address,
            questId,
            fid,
            accessToken,
        }: {
            address: string;
            questId: string;
            fid?: number;
            accessToken?: string;
        }) => {
            const result = await claimQuest(address, questId, fid, accessToken);
            return result;
        },
        onSuccess: async (result, variables) => {
            if (result.verified) {
                // Update both quests and user points
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["quests", variables.address],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["user", variables.address],
                    }),
                ]);
            }
        },
    });
}

export function useVerifyQuestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            address,
            fid,
            accessToken,
        }: {
            address: string;
            fid?: number;
            accessToken?: string;
        }) => {
            const result = await verifyQuest(address, fid, accessToken);
            return result;
        },
        onSuccess: async (result, variables) => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: ["quests", variables.address],
                });
            }
        },
    });
}
