import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimQuest, verifyQuest } from "@/lib/api/quests";
import { VerifyQuestResponse } from "@/lib/types/api";

export function useClaimQuestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            address,
            questId,
            fid,
        }: {
            address: string;
            questId: string;
            fid?: number;
        }) => {
            const result = await claimQuest(address, questId, fid);
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
        }: {
            address: string;
            fid?: number;
        }) => {
            const result = await verifyQuest(address, fid);
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
