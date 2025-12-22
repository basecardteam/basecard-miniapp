import { useFrameContext } from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import { useERC721Token } from "@/hooks/evm/useERC721Token";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { Quest } from "@/lib/types/api";
import { resolveIpfsUrl } from "@/lib/utils";
import sdk from "@farcaster/miniapp-sdk";
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
    const { claim } = useMyQuests();
    const { showToast } = useToast();
    const frameContext = useFrameContext();
    const { metadata } = useERC721Token();
    const openUrl = sdk.actions.openUrl;

    const [successModalState, setSuccessModalState] = useState<{
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    }>({ isOpen: false, rewarded: 0, newTotalPoints: 0 });

    const handleQuestAction = useCallback(
        async (quest: Quest) => {
            console.log("handleQuestAction called:", quest.actionType, quest.status);

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
                const shareUrl = address
                    ? `${process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app"}/card/${address}`
                    : process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app";
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
            case "FC_FOLLOW": {
                const fcUrl = "https://warpcast.com/basecardteam";
                if (frameContext?.isInMiniApp) {
                    try {
                        await openUrl({ url: fcUrl });
                    } catch {
                        window.open(fcUrl, "_blank");
                    }
                } else {
                    window.open(fcUrl, "_blank");
                }
                return;
            }
            case "FC_LINK":
                router.push("/edit-profile");
                return;

            // === Twitter ===
            case "X_FOLLOW": {
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
            case "X_LINK":
                router.push("/edit-profile");
                return;

            // === App ===
            case "APP_NOTIFICATION": {
                if (!frameContext?.requestNotificationPermission) {
                    showToast("Notification not supported", "error");
                    return;
                }
                try {
                    const result = await frameContext.requestNotificationPermission();
                    if (result.success && result.notificationDetails) {
                        showToast("Notifications enabled!", "success");
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
                        err instanceof Error ? err.message : "Failed to enable notifications",
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
            case "APP_ADD_MINIAPP":
                showToast("Add Basecard to your home screen", "info");
                return;
            case "APP_REFERRAL": {
                const referralUrl = address
                    ? `${process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app"}?ref=${address}`
                    : process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app";
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

            // === Link accounts (all go to edit profile) ===
            case "GH_LINK":
            case "LI_LINK":
            case "BASE_LINK_NAME":
            case "WEB_LINK":
                router.push("/edit-profile");
                return;

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
                        err instanceof Error ? err.message : "Failed to claim quest",
                        "error"
                    );
                }
            }
        },
        [claim, router, showToast, frameContext, address, metadata, openUrl]
    );

    return {
        handleQuestAction,
        successModalState,
        setSuccessModalState,
    };
}
