"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/components/providers/AuthProvider";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import QuestItem from "@/features/quest/components/QuestItem";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useQuests } from "@/hooks/api/useQuests";
import { Quest } from "@/lib/types/api";

export default function QuestScreen() {
    const { quests, isLoading, error, claimingQuest, isAuthenticated } =
        useQuests();
    const { handleQuestAction, successModalState, setSuccessModalState } =
        useQuestHandler();
    const { isAuthLoading } = useAuth();

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

                {/* Login prompt for unauthenticated users */}
                {!isAuthLoading && !isAuthenticated && (
                    <div className="w-full max-w-[340px] bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 text-center">
                        <div className="text-white/90 text-sm">
                            🔐 Sign in to track your progress and claim rewards
                        </div>
                    </div>
                )}

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
                                onAction={() => handleQuestAction(quest)}
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
