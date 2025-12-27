import { useFrameContext } from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import { useUser } from "@/hooks/api/useUser";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { handleAppAddMiniapp, handleFcFollow } from "@/lib/quest-actions";
import { Quest, SocialKey } from "@/lib/types/api";
import sdk from "@farcaster/miniapp-sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Map actionType to social key for link quests
 */
const ACTION_TO_SOCIAL_KEY: Record<string, SocialKey> = {
    GH_LINK: "github",
    LI_LINK: "linkedin",
    X_LINK: "x",
    FC_LINK: "farcaster",
    WEB_LINK: "website",
    BASE_LINK_NAME: "basename",
};

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
    const { claim, markPendingAction, verifyAction } = useMyQuests();
    const { card } = useUser();
    const { showToast } = useToast();
    const frameContext = useFrameContext();
    const queryClient = useQueryClient();
    const openUrl = sdk.actions.openUrl;

    // Get user's current socials for verification
    const userSocials = card?.socials ?? {};

    const [successModalState, setSuccessModalState] = useState<{
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    }>({ isOpen: false, rewarded: 0, newTotalPoints: 0 });

    const handleQuestAction = useCallback(
        async (quest: Quest) => {
            console.log(
                "handleQuestAction called:",
                quest.actionType,
                quest.status
            );

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

            // Handle pending quests by action type
            switch (quest.actionType) {
                // === Farcaster ===
                case "FC_SHARE":
                case "FC_POST_HASHTAG": {
                    // Mark as pending before opening external link
                    markPendingAction(quest.actionType);

                    const shareUrl = address
                        ? `${
                              process.env.NEXT_PUBLIC_URL ||
                              "https://basecard.vercel.app"
                          }/card/${address}`
                        : process.env.NEXT_PUBLIC_URL ||
                          "https://basecard.vercel.app";
                    // const imageUrl = card?.image
                    //     ? resolveIpfsUrl(card.image)
                    //     : undefined;
                    const imageUrl = "";
                    // Uses DEFAULT_SHARE_TEXT from share.ts
                    await shareToFarcaster({
                        imageUrl,
                        embedUrl: shareUrl,
                    });
                    return;
                }
                case "FC_FOLLOW":
                    // Mark as pending before opening external link
                    markPendingAction(quest.actionType);
                    await handleFcFollow();
                    return;
                case "FC_LINK":
                    router.push("/edit-profile");
                    return;

                // === Twitter ===
                case "X_FOLLOW": {
                    // Mark as pending before opening external link
                    markPendingAction(quest.actionType);

                    const xUrl = "https://x.com/basecardteam";
                    if (frameContext?.isInMiniApp) {
                        try {
                            await openUrl({ url: xUrl });
                        } catch {
                            window.open(xUrl, "_blank");
                        }
                    } else {
                        window.open(xUrl, "_blank");
                    }
                    return;
                }

                // === App ===
                case "APP_NOTIFICATION": {
                    if (!frameContext?.requestNotificationPermission) {
                        showToast("Notification not supported", "error");
                        return;
                    }
                    try {
                        const result =
                            await frameContext.requestNotificationPermission();
                        if (result.success && result.notificationDetails) {
                            showToast("Notifications enabled!", "success");
                            const claimResult = await claim(quest);
                            if (claimResult && claimResult.verified) {
                                setSuccessModalState({
                                    isOpen: true,
                                    rewarded: claimResult.rewarded ?? 0,
                                    newTotalPoints:
                                        claimResult.newTotalPoints ?? 0,
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
                case "APP_BASECARD_MINT":
                    router.push("/mint");
                    return;
                case "APP_BIO_UPDATE":
                case "APP_SKILL_TAG":
                    router.push("/edit-profile");
                    return;
                case "APP_ADD_MINIAPP": {
                    const result = await handleAppAddMiniapp();
                    // Refetch quests to update status
                    await queryClient.invalidateQueries({
                        queryKey: ["userQuests"],
                    });
                    if (result.isAppAdded && result.hasNotifications) {
                        showToast(
                            "Basecard added with notifications!",
                            "success"
                        );
                    } else if (result.isAppAdded) {
                        showToast("Basecard added to home screen!", "success");
                    } else {
                        showToast("Failed to add Basecard", "error");
                    }
                    return;
                }
                case "APP_REFERRAL": {
                    const referralUrl = address
                        ? `${
                              process.env.NEXT_PUBLIC_URL ||
                              "https://basecard.vercel.app"
                          }?ref=${address}`
                        : process.env.NEXT_PUBLIC_URL ||
                          "https://basecard.vercel.app";
                    await shareToFarcaster({
                        text: "Join Basecard and build your on-chain profile!",
                        embedUrl: referralUrl,
                    });
                    return;
                }
                case "APP_DAILY_CHECKIN":
                case "APP_VOTE":
                case "APP_MANUAL":
                    // These are verified server-side, just show info
                    showToast("Complete this action to claim", "info");
                    return;

                // === Link accounts ===
                case "GH_LINK":
                case "LI_LINK":
                case "X_LINK":
                case "BASE_LINK_NAME":
                case "WEB_LINK": {
                    // Only check for auto-verify when status is pending
                    if (quest.status === "pending") {
                        const socialKey =
                            ACTION_TO_SOCIAL_KEY[quest.actionType];
                        const hasSocial = socialKey && userSocials[socialKey];

                        // If social is already linked, try to verify (not claim)
                        if (hasSocial) {
                            try {
                                const result = await verifyAction(
                                    quest.actionType
                                );
                                if (result && result.verified) {
                                    showToast(
                                        "Quest verified! You can now claim your reward.",
                                        "success"
                                    );
                                }
                            } catch (err) {
                                showToast(
                                    err instanceof Error
                                        ? err.message
                                        : "Failed to verify quest",
                                    "error"
                                );
                            }
                            return;
                        }
                    }

                    // Social not linked yet OR not pending, go to edit-profile
                    router.push("/edit-profile");
                    return;
                }

                default:
                    // Unknown action type - try to claim anyway
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
            }
        },
        [claim, router, showToast, frameContext, address, openUrl]
    );

    return {
        handleQuestAction,
        successModalState,
        setSuccessModalState,
    };
}
