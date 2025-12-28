import { useAuth } from "@/components/providers/AuthProvider";
import { CreateBaseCardParams } from "@/lib/api/basecards";
import { fetchUser } from "@/lib/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { useMintBaseCard } from "./useMintBaseCard";

export function useMintBaseCardMutation() {
    const { address } = useAccount();
    const { accessToken } = useAuth();
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
                    hash: result.hash as `0x${string}`,
                });
            }

            // 3. Invalidate Queries
            if (accessToken) {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["user"],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["userQuests", accessToken],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["myBaseCard", accessToken],
                    }),
                ]);

                // 4. Fetch updated user to get the new card ID
                const updatedUser = await fetchUser(accessToken);
                if (updatedUser?.card?.id) {
                    return { ...result, cardId: updatedUser.card.id };
                }
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
