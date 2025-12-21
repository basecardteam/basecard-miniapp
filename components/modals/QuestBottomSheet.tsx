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
    onAction: (quest: Quest) => void;
    getButtonName: (quest: Quest) => string;
}

export default function QuestBottomSheet({
    isOpen,
    onClose,
    quests,
    claimingQuest,
    onAction,
    getButtonName,
}: QuestBottomSheetProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [closingWithDrag, setClosingWithDrag] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef(0);
    const lastTouchTimeRef = useRef(0);

    const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
        if (e.animationName === "slideUp") {
            setHasAnimatedIn(true);
        }
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setHasAnimatedIn(false);
            setDragY(0);
            onClose();
        }, 300);
    }, [onClose]);

    const handleDragClose = useCallback(() => {
        setClosingWithDrag(true);
        const sheetHeight = sheetRef.current?.offsetHeight || 500;
        setDragY(sheetHeight);
        setTimeout(() => {
            setClosingWithDrag(false);
            setHasAnimatedIn(false);
            setDragY(0);
            onClose();
        }, 300);
    }, [onClose]);

    const handleDragHandleTouchStart = useCallback((e: React.TouchEvent) => {
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

    const handleDragHandleTouchEnd = useCallback(() => {
        lastTouchTimeRef.current = Date.now();
        setIsDragging(false);
        if (dragY > 150) {
            handleDragClose();
        } else {
            setDragY(0);
        }
    }, [dragY, handleDragClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        // Ignore ghost clicks that happen shortly after touch events
        const timeSinceTouch = Date.now() - lastTouchTimeRef.current;
        if (timeSinceTouch < 300) {
            return;
        }

        // Only close if clicking directly on the backdrop, not bubbled events
        if (e.target === e.currentTarget) {
            handleClose();
        }
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
                className="absolute inset-0 bg-black/50 z-0"
                onClick={handleBackdropClick}
                onTouchEnd={(e) => {
                    // Only close if touch ends directly on backdrop
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                        handleClose();
                    }
                }}
            />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-10"
                style={{
                    maxHeight: "90vh",
                    transform: (isDragging || closingWithDrag) ? `translateY(${dragY}px)` : undefined,
                    animation:
                        isDragging || closingWithDrag
                            ? "none"
                            : isClosing
                                ? "slideDown 300ms ease-out forwards"
                                : hasAnimatedIn
                                    ? "none"
                                    : "slideUp 300ms ease-out forwards",
                    transition: isDragging ? "none" : "transform 300ms ease-out",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchMove={handleTouchMove}
                onAnimationEnd={handleAnimationEnd}
            >
                {/* Drag Handle */}
                <div
                    className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
                    onTouchStart={handleDragHandleTouchStart}
                    onTouchEnd={handleDragHandleTouchEnd}
                >
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
                                onAction={() => {
                                    onAction(quest);
                                }}
                            />
                        ))}
                    </div>
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
}
