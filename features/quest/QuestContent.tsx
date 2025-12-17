"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { useToast } from "@/components/ui/Toast";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import QuestItem from "@/features/quest/components/QuestItem";
import { useQuests } from "@/features/quest/hooks/useQuests";
import { logger } from "@/lib/common/logger";
import { Quest } from "@/lib/types/api";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function QuestContent() {
    const router = useRouter();
    const { quests, isLoading, error, claimingQuest, claim } = useQuests();
    const { showToast } = useToast();
    const [successModalState, setSuccessModalState] = useState<{
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    }>({ isOpen: false, rewarded: 0, newTotalPoints: 0 });

    const handleClaim = useCallback(
        async (quest: Quest) => {
            // Priority 1: If claimable, always try to claim first
            if (quest.status === "claimable") {
                try {
                    const result = await claim(quest);
                    if (result && result.verified) {
                        setSuccessModalState({
                            isOpen: true,
                            rewarded: result.rewarded ?? quest.rewardAmount,
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

            if (quest.actionType === "SHARE") {
                alert("something");
                return;
            }
            // Priority 3: Redirects for uncompleted actions
            if (quest.actionType === "MINT" && quest.status === "pending") {
                router.push("/mint");
                return;
            }
            if (
                quest.actionType === "LINK_TWITTER" ||
                quest.status === "pending"
            ) {
                router.push("/my-base-card");
                return;
            }

            // Default: Try to verify/claim (e.g. for actions verified on backend)
            try {
                const result = await claim(quest);

                if (result) {
                    setSuccessModalState({
                        isOpen: true,
                        rewarded: result.rewarded ?? quest.rewardAmount,
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
        [claim, router, showToast]
    );

    const getButtonName = (quest: Quest) => {
        if (quest.status === "completed") return "Claimed";
        if (quest.status === "claimable") return "Claim!";
        return quest.actionType;
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
                                onClaim={() => handleClaim(quest)}
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
