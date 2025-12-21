import { claimQuest, verifyQuest } from "@/lib/api/quests";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClaimQuestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            accessToken,
            questId,
            address,
        }: {
            accessToken: string;
            questId: string;
            address: string;
        }) => {
            const result = await claimQuest(questId, accessToken, address);
            return result;
        },
        onSuccess: async (result) => {
            if (result.verified) {
                // Update both quests and user points
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["userQuests"],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["user"],
                    }),
                ]);
            }
        },
    });
}

export function useVerifyQuestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ accessToken }: { accessToken: string }) => {
            const result = await verifyQuest(accessToken);
            return result;
        },
        onSuccess: async (result) => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: ["userQuests"],
                });
            }
        },
    });
}
