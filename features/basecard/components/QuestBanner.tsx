"use client";

import QuestBottomSheet from "@/components/modals/QuestBottomSheet";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { TbLicense } from "react-icons/tb";
import { useMemo, useState } from "react";

/**
 * QuestBanner - 퀘스트 배너 버튼
 *
 * 배너만 표시하고, 클릭 시 QuestBottomSheet를 열음.
 * 퀘스트 데이터는 배너 표시용으로만 사용.
 * 실제 퀘스트 관리는 QuestBottomSheet 내부에서 처리.
 */
export default function QuestBanner() {
    const [isQuestSheetOpen, setIsQuestSheetOpen] = useState(false);

    // 배너 표시용 데이터만 가져옴
    const { quests, isLoading } = useMyQuests();

    // Derived states - 배너 표시용
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
                        <TbLicense
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

            {/* Quest Bottom Sheet - 내부에서 모든 상태 관리 */}
            <QuestBottomSheet
                isOpen={isQuestSheetOpen}
                onClose={() => setIsQuestSheetOpen(false)}
            />
        </>
    );
}
