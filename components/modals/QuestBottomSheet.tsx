"use client";

import QuestItem from "@/features/quest/components/QuestItem";
import { Quest } from "@/lib/types/api";
import { Gift, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface QuestBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    quests: Quest[];
    claimingQuest: string | null;
    onClaim: (quest: Quest) => void;
    getButtonName: (quest: Quest) => string;
}

export default function QuestBottomSheet({
    isOpen,
    onClose,
    quests,
    claimingQuest,
    onClaim,
    getButtonName,
}: QuestBottomSheetProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef(0);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setDragY(0);
            onClose();
        }, 300);
    }, [onClose]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startYRef.current = e.touches[0].clientY;
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isDragging) return;
            const currentY = e.touches[0].clientY;
            const diff = currentY - startYRef.current;
            if (diff > 0) {
                setDragY(diff);
            }
        },
        [isDragging]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        if (dragY > 150) {
            handleClose();
        } else {
            setDragY(0);
        }
    }, [dragY, handleClose]);

    const handleBackdropClick = useCallback(() => {
        handleClose();
    }, [handleClose]);

    // Don't render if not open and not closing
    if (!isOpen && !isClosing) return null;

    const claimableCount = quests.filter((q) => q.status === "claimable").length;
    const completedCount = quests.filter((q) => q.status === "completed").length;

    // Sort: claimable → pending → completed
    const sortedQuests = [...quests].sort((a, b) => {
        const order: Record<string, number> = {
            claimable: 0,
            pending: 1,
            completed: 2,
        };
        return (
            (order[a.status ?? "pending"] ?? 1) -
            (order[b.status ?? "pending"] ?? 1)
        );
    });

    return (
        <div className="fixed inset-0 z-[9999]">
            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleBackdropClick}
            />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
                style={{
                    maxHeight: "90vh",
                    transform: isDragging ? `translateY(${dragY}px)` : undefined,
                    animation:
                        isDragging || dragY > 0
                            ? "none"
                            : isClosing
                                ? "slideDown 300ms ease-out forwards"
                                : "slideUp 300ms ease-out forwards",
                    transition: isDragging ? "none" : "transform 300ms ease-out",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
                    <div className="w-9 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-4 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                            <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-none">
                                Quests
                            </h2>
                            <p className="text-xs text-gray-500">
                                {claimableCount > 0
                                    ? `${claimableCount} reward${claimableCount > 1 ? "s" : ""} available`
                                    : `${completedCount}/${quests.length} completed`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                </div>

                {/* Quest List */}
                <div
                    className="overflow-y-auto overscroll-y-contain px-4 py-3"
                    style={{ maxHeight: "calc(90vh - 72px)" }}
                >
                    <div className="flex flex-col gap-2.5">
                        {sortedQuests.map((quest, index) => (
                            <QuestItem
                                key={index}
                                title={quest.title}
                                content={quest.description || ""}
                                buttonName={getButtonName(quest)}
                                point={quest.rewardAmount}
                                isCompleted={quest.status === "completed"}
                                isClaimable={quest.status === "claimable"}
                                isClaiming={claimingQuest === quest.actionType}
                                onClaim={() => onClaim(quest)}
                            />
                        ))}
                    </div>
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
}
