"use client";

import FullScreenLoadingOverlay from "@/components/modals/FullScreenLoadingOverlay";
import SuccessModal from "@/components/modals/SuccessModal";
import QuestList from "@/features/quest/components/QuestList";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import { TbLicense } from "react-icons/tb";

export default function QuestPage() {
    const { quests, isLoading } = useMyQuests();

    const {
        handleQuestAction,
        verifiableActions,
        isProcessing,
        processingMessage,
        successModalState,
        setSuccessModalState,
    } = useQuestHandler();

    const claimableCount = quests.filter(
        (q) => q.status === "claimable"
    ).length;
    const completedCount = quests.filter(
        (q) => q.status === "completed"
    ).length;

    return (
        <div
            className="w-full flex flex-col"
            style={{
                minHeight:
                    "calc(100dvh - var(--header-h, 60px) - var(--bottom-nav-h, 64px))",
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <TbLicense className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-none">
                        Quests
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {claimableCount > 0
                            ? `${claimableCount} reward${
                                  claimableCount > 1 ? "s" : ""
                              } available`
                            : `${completedCount}/${quests.length} completed`}
                    </p>
                </div>
            </div>

            {/* Quest List */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {isLoading ? (
                    <div className="flex flex-col gap-2.5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-100 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <QuestList
                        quests={quests}
                        verifiableActions={verifiableActions}
                        onAction={handleQuestAction}
                        className="flex flex-col gap-2.5"
                    />
                )}
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModalState.isOpen}
                onClose={() =>
                    setSuccessModalState((prev) => ({ ...prev, isOpen: false }))
                }
                title="Quest Claimed!"
                description={`You earned +${successModalState.rewarded} Points.\nTotal Balance: ${successModalState.newTotalPoints} Points`}
                buttonText="Awesome!"
            />

            {/* Loading Overlay */}
            <FullScreenLoadingOverlay
                isOpen={isProcessing}
                title={processingMessage || "Processing..."}
                description="Please wait a moment"
            />
        </div>
    );
}
