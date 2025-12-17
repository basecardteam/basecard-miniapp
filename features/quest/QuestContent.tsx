"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { useFrameContext } from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import QuestItem from "@/features/quest/components/QuestItem";
import { useQuests } from "@/features/quest/hooks/useQuests";
import { useERC721Token } from "@/hooks/useERC721Token";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { Quest } from "@/lib/types/api";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

export default function QuestContent() {
    const router = useRouter();
    const { address } = useAccount();
    const { quests, isLoading, error, claimingQuest, claim } = useQuests();
    const { metadata } = useERC721Token();
    const { showToast } = useToast();
    const frameContext = useFrameContext();

    const [successModalState, setSuccessModalState] = useState<{
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    }>({ isOpen: false, rewarded: 0, newTotalPoints: 0 });

    const handleClaim = useCallback(
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
                    ? `${process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app"}/card/${address}`
                    : process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app";
                const imageUrl = metadata?.image ? resolveIpfsUrl(metadata.image) : undefined;

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
                    const result = await frameContext.requestNotificationPermission();
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
                        err instanceof Error ? err.message : "Failed to enable notifications",
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

            // Link 관련 퀘스트는 EditProfile 페이지로 이동
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
        [claim, router, showToast, frameContext, address, metadata.image]
    );

    const getButtonName = (quest: Quest) => {
        if (quest.status === "completed") return "Claimed";
        if (quest.status === "claimable") return "Claim!";

        // 친숙한 버튼 텍스트
        const buttonLabels: Record<string, string> = {
            MINT: "Mint",
            SHARE: "Share",
            FOLLOW: "Follow",
            NOTIFICATION: "Enable",
            LINK_BASENAME: "Link",
            LINK_FARCASTER: "Link",
            LINK_GITHUB: "Link",
            LINK_LINKEDIN: "Link",
            LINK_TWITTER: "Link",
            LINK_WEBSITE: "Link",
        };

        return buttonLabels[quest.actionType] || quest.actionType;
    };

    return (
        <div className="relative w-full min-h-full flex flex-col items-center overflow-y-auto overscroll-y-none pb-20 bg-[#0050ff]">
            {/* Content Container */}
            <div className="w-full flex flex-col items-center pt-10 px-6">
                {/* Hero Section */}
                <QuestHeroSection />

                {/* Quest List */}
                <div className="flex flex-col gap-4 w-full max-w-[340px] items-center">
                    {isLoading ? (
                        <div className="text-white/80 text-center py-8">
                            Loading quests...
                        </div>
                    ) : error ? (
                        <div className="text-red-300 text-center py-8">
                            {error}
                        </div>
                    ) : quests.length === 0 ? (
                        <div className="text-white/80 text-center py-8">
                            No quests available
                        </div>
                    ) : (
                        quests.map((quest, index) => (
                            <QuestItem
                                key={index}
                                title={quest.title}
                                content={quest.description || ""}
                                buttonName={getButtonName(quest)}
                                point={quest.rewardAmount}
                                isCompleted={quest.status === "completed"}
                                isClaimable={quest.status === "claimable"}
                                isClaiming={claimingQuest === quest.actionType}
                                onAction={() => handleClaim(quest)}
                            />
                        ))
                    )}
                </div>
            </div>
            {/* Modal */}
            <SuccessModal
                isOpen={successModalState.isOpen}
                onClose={() =>
                    setSuccessModalState((prev) => ({ ...prev, isOpen: false }))
                }
                title="Quest Claimed!"
                description={`You earned +${successModalState.rewarded} BC.\nTotal Balance: ${successModalState.newTotalPoints} BC`}
                buttonText="Awesome!"
            />
        </div>
    );
}
