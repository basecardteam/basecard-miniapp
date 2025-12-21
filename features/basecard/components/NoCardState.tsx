"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { useToast } from "@/components/ui/Toast";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import QuestItem from "@/features/quest/components/QuestItem";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useQuests } from "@/hooks/api/useQuests";
import { Quest } from "@/lib/types/api";
import { useRouter } from "next/navigation";

export const NoCardState = () => {
    const router = useRouter();
    const { quests, isLoading, error, claimingQuest } = useQuests();
    const { showToast } = useToast();
    const { handleQuestAction, successModalState, setSuccessModalState } =
        useQuestHandler();

    const getButtonName = (quest: Quest) => {
        if (quest.status === "completed") return "Claimed";
        if (quest.status === "claimable") return "Claim!";
        return quest.actionType;
    };

    return (
        <>
            <div className="w-full flex flex-col items-center pt-4">
                {/* Hero Section */}
                <QuestHeroSection />

                {/* Quest List */}
                <div className="flex flex-col gap-4 w-full max-w-[340px] items-center px-2">
                    <h2 className="text-white text-xl font-bold font-k2d w-full text-center mb-2">
                        QUEST
                    </h2>
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

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModalState.isOpen}
                onClose={() =>
                    setSuccessModalState((prev) => ({ ...prev, isOpen: false }))
                }
                title="Quest Claimed!"
                description={`You earned +${successModalState.rewarded} BC.\nTotal Balance: ${successModalState.newTotalPoints} BC`}
                buttonText="Awesome!"
            />
        </>
    );
};
