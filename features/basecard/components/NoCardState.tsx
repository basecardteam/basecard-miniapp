"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import QuestList from "@/features/quest/components/QuestList";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useMyQuests } from "@/hooks/api/useMyQuests";

export const NoCardState = () => {
    const { quests, isLoading, error, claimingQuest, verifyingActions } =
        useMyQuests();
    const { handleQuestAction, successModalState, setSuccessModalState } =
        useQuestHandler();

    return (
        <>
            <div className="w-full flex flex-col items-center pt-4 gap-y-10">
                {/* Hero Section */}
                <QuestHeroSection />

                {/* Quest List */}
                <div className="flex flex-col gap-4 w-full items-center px-2">
                    <div className="text-white text-2xl font-bold font-k2d w-full text-center mb-2">
                        QUEST
                    </div>
                    <QuestList
                        quests={quests}
                        claimingQuest={claimingQuest}
                        verifyingActions={verifyingActions}
                        onAction={handleQuestAction}
                        isLoading={isLoading}
                        error={error}
                        variant="dark"
                        className="flex flex-col gap-4 w-full"
                    />
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
