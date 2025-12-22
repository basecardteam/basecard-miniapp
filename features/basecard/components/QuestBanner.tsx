"use client";

import QuestBottomSheet from "@/components/modals/QuestBottomSheet";
import SuccessModal from "@/components/modals/SuccessModal";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import { Quest } from "@/lib/types/api";
import clsx from "clsx";
import { ChevronRight, Gift } from "lucide-react";
import { useMemo, useState } from "react";

export default function QuestBanner() {
    const [isQuestSheetOpen, setIsQuestSheetOpen] = useState(false);

    // Quest hooks
    const { quests, claimingQuest, isLoading } = useMyQuests();
    const { handleQuestAction, successModalState, setSuccessModalState } =
        useQuestHandler();

    // Derived states
    const incompleteCount = useMemo(
        () => quests.filter((q) => q.status !== "completed").length,
        [quests]
    );

    const claimableCount = useMemo(
        () => quests.filter((q) => q.status === "claimable").length,
        [quests]
    );

    const claimableAmount = useMemo(
        () =>
            quests
                .filter((q) => q.status === "claimable")
                .reduce((sum, q) => sum + q.rewardAmount, 0),
        [quests]
    );

    const hasClaimable = claimableCount > 0;

    // Handlers
    const getButtonName = (quest: Quest) => {
        if (quest.status === "completed") return "Claimed";
        if (quest.status === "claimable") return "Claim!";

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

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="w-full px-4 pt-2">
                <div className="w-full h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        );
    }

    // Don't render if no quests
    if (quests.length === 0) return null;

    return (
        <>
            {/* Quest Banner Button */}
            <div className="w-full px-4 pt-2">
                <button
                    onClick={() => setIsQuestSheetOpen(true)}
                    className={clsx(
                        "w-full flex items-center justify-between px-3 py-1.5 rounded-lg",
                        "active:scale-[0.98] transition-transform",
                        hasClaimable
                            ? "bg-[#007AFF] text-white"
                            : "bg-[#007AFF]/10 border border-[#007AFF]/20"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Gift
                            className={clsx(
                                "w-4 h-4",
                                hasClaimable ? "text-white" : "text-[#007AFF]"
                            )}
                        />
                        <span
                            className={clsx(
                                "font-semibold text-xs font-k2d",
                                hasClaimable ? "text-white" : "text-[#007AFF]"
                            )}
                        >
                            {hasClaimable
                                ? `Claim +${claimableAmount} BC`
                                : `${incompleteCount} Quest${
                                      incompleteCount > 1 ? "s" : ""
                                  }`}
                        </span>
                    </div>
                    <ChevronRight
                        className={clsx(
                            "w-3.5 h-3.5",
                            hasClaimable ? "text-white" : "text-[#007AFF]"
                        )}
                    />
                </button>
            </div>

            {/* Quest Success Modal */}
            <SuccessModal
                isOpen={successModalState.isOpen}
                onClose={() =>
                    setSuccessModalState((prev) => ({ ...prev, isOpen: false }))
                }
                title="Quest Claimed!"
                description={`You earned +${successModalState.rewarded} BC.\nTotal Balance: ${successModalState.newTotalPoints} BC`}
                buttonText="Awesome!"
            />

            {/* Quest Bottom Sheet */}
            <QuestBottomSheet
                isOpen={isQuestSheetOpen}
                onClose={() => setIsQuestSheetOpen(false)}
                quests={quests}
                claimingQuest={claimingQuest}
                onAction={handleQuestAction}
            />
        </>
    );
}
