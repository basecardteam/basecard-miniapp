import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePublicClient, useAccount } from "wagmi";
import { useMintBaseCard } from "./useMintBaseCard";
import { CreateBaseCardParams } from "@/lib/api/basecards";

export function useMintBaseCardMutation() {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const publicClient = usePublicClient();
    const {
        mintCard,
        isCreatingBaseCard,
        isSendingTransaction,
        error: mintError,
    } = useMintBaseCard();

    const mutation = useMutation({
        mutationFn: async (input: CreateBaseCardParams) => {
            // 1. Execute minting flow (Backend API + Contract Write)
            // This hook manages its own internal loading states (isCreatingBaseCard, isSendingTransaction)
            const result = await mintCard(input);

            if (!result.success) {
                // Return early if minting failed or was rejected
                // We throw here so useMutation sees it as an error,
                // unless it was "User rejected" which we might handle gracefully.
                // However, useMintBaseCard implementation returns { success: false, error: ... }
                // UseMutation expects a thrown error for 'onError' flow.
                throw new Error(result.error || "Minting failed");
            }

            // 2. Wait for Transaction Receipt
            if (publicClient && result.hash) {
                await publicClient.waitForTransactionReceipt({
                    hash: result.hash,
                });
            }

            // 3. Invalidate Queries
            if (address) {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["user", address],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["quests", address],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["myBaseCard", address],
                    }),
                ]);
            }

            return result;
        },
    });

    return {
        ...mutation,
        // Expose the granular loading states from the underlying hook
        isCreatingBaseCard,
        isSendingTransaction,
        // Calculate "Mining" state: Mutation is pending but not in the creation/sending phases
        isMining:
            mutation.isPending && !isCreatingBaseCard && !isSendingTransaction,
        // Combine errors ideally, but mutation.error captures the throw above
        error: mutation.error || mintError,
    };
}
