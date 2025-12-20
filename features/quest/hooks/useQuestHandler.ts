import { useFrameContext } from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import { useQuests } from "@/hooks/api/useQuests";
import { useERC721Token } from "@/hooks/useERC721Token";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { Quest } from "@/lib/types/api";
import { resolveIpfsUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

interface UseQuestHandlerResult {
    handleQuestAction: (quest: Quest) => Promise<void>;
    successModalState: {
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    };
    setSuccessModalState: React.Dispatch<
        React.SetStateAction<{
            isOpen: boolean;
            rewarded: number;
            newTotalPoints: number;
        }>
    >;
}

export function useQuestHandler(): UseQuestHandlerResult {
    const router = useRouter();
    const { address } = useAccount();
    const { claim } = useQuests();
    const { showToast } = useToast();
    const frameContext = useFrameContext();
    const { metadata } = useERC721Token();

    const [successModalState, setSuccessModalState] = useState<{
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    }>({ isOpen: false, rewarded: 0, newTotalPoints: 0 });

    const handleQuestAction = useCallback(
        async (quest: Quest) => {
            // If claimable, always try to claim first
            if (quest.status === "claimable") {
                try {
                    const result = await claim(quest);
                    if (result && result.verified) {
                        setSuccessModalState({
                            isOpen: true,
                            rewarded: result.rewarded ?? 0,
                            newTotalPoints: result.newTotalPoints ?? 0,
                        });
                    }
                } catch (err) {
                    showToast(
                        err instanceof Error
                            ? err.message
                            : "Failed to claim quest",
                        "error"
                    );
                }
                return;
            }

            // Handle SHARE quest - share to Farcaster
            if (quest.actionType === "SHARE") {
                const shareUrl = address
                    ? `${
                          process.env.NEXT_PUBLIC_URL ||
                          "https://basecard.vercel.app"
                      }/card/${address}`
                    : process.env.NEXT_PUBLIC_URL ||
                      "https://basecard.vercel.app";
                const imageUrl = metadata?.image
                    ? resolveIpfsUrl(metadata.image)
                    : undefined;

                await shareToFarcaster({
                    text: "I just minted my Basecard! Collect this and check all about myself",
                    imageUrl,
                    embedUrl: shareUrl,
                });
                return;
            }

            // Handle NOTIFICATION quest - request notification permission
            if (quest.actionType === "NOTIFICATION") {
                if (!frameContext?.requestNotificationPermission) {
                    showToast("Notification not supported", "error");
                    return;
                }

                try {
                    const result =
                        await frameContext.requestNotificationPermission();
                    if (result.success && result.notificationDetails) {
                        showToast("Notifications enabled!", "success");
                        // Verify the quest after enabling notifications
                        const claimResult = await claim(quest);
                        if (claimResult && claimResult.verified) {
                            setSuccessModalState({
                                isOpen: true,
                                rewarded: claimResult.rewarded ?? 0,
                                newTotalPoints: claimResult.newTotalPoints ?? 0,
                            });
                        }
                    } else if (result.reason === "not_in_miniapp") {
                        showToast("Please open in Base app", "warning");
                    }
                } catch (err) {
                    showToast(
                        err instanceof Error
                            ? err.message
                            : "Failed to enable notifications",
                        "error"
                    );
                }
                return;
            }

            // Redirects for uncompleted actions
            if (quest.actionType === "MINT" && quest.status === "pending") {
                router.push("/mint");
                return;
            }

            // Link quests redirect to EditProfile
            if (quest.actionType.startsWith("LINK_")) {
                router.push("/edit-profile");
                return;
            }

            // Default: Try to verify/claim
            try {
                const result = await claim(quest);
                if (result) {
                    setSuccessModalState({
                        isOpen: true,
                        rewarded: result.rewarded ?? 0,
                        newTotalPoints: result.newTotalPoints ?? 0,
                    });
                }
            } catch (err) {
                showToast(
                    err instanceof Error
                        ? err.message
                        : "Failed to claim quest",
                    "error"
                );
            }
        },
        [claim, router, showToast, frameContext, address, metadata?.image]
    );

    return {
        handleQuestAction,
        successModalState,
        setSuccessModalState,
    };
}
