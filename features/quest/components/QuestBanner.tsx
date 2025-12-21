"use client";

import { useQuests } from "@/hooks/api/useQuests";
import clsx from "clsx";
import { ChevronRight, Gift } from "lucide-react";
import { useMemo } from "react";

interface QuestBannerProps {
    onClick: () => void;
}

export default function QuestBanner({ onClick }: QuestBannerProps) {
    const { quests } = useQuests();

    const { claimableCount, claimableAmount, incompleteCount } = useMemo(() => {
        const claimable = quests.filter((q) => q.status === "claimable");
        return {
            claimableCount: claimable.length,
            claimableAmount: claimable.reduce((sum, q) => sum + q.rewardAmount, 0),
            incompleteCount: quests.filter((q) => q.status !== "completed").length,
        };
    }, [quests]);

    if (quests.length === 0) return null;

    const hasClaimable = claimableCount > 0;

    return (
        <div className="w-full px-4 pt-2">
            <button
                onClick={onClick}
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
                            : `${incompleteCount} Quest${incompleteCount > 1 ? "s" : ""}`}
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
    );
}
