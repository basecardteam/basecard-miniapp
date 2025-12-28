"use client";

import { ACTION_BUTTON_LABELS, ActionType } from "@/lib/quest-actions";
import { Quest } from "@/lib/types/api";
import { useMemo } from "react";
import QuestEmptyState from "./QuestEmptyState";
import QuestItem from "./QuestItem";
import QuestItemSkeleton from "./QuestItemSkeleton";

// =============================================================================
// Types
// =============================================================================

/**
 * Quest UI 상태
 * - completed: 완료됨
 * - claimable: claim 가능
 * - verifiable: verify 가능 (handler에서 결정)
 * - pending: 아직 action 필요
 */
type QuestUIState = "completed" | "claimable" | "verifiable" | "pending";

interface QuestListProps {
    quests: Quest[];
    verifiableActions?: string[];
    onAction: (quest: Quest) => void;
    className?: string;
    itemClassName?: string;
    isLoading?: boolean;
    error?: string | null;
    skeletonCount?: number;
    variant?: "light" | "dark";
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Quest 상태에 따른 버튼 라벨 반환
 */
function getButtonLabel(quest: Quest, uiState: QuestUIState): string {
    switch (uiState) {
        case "completed":
            return "Claimed";
        case "claimable":
            return "Claim!";
        case "verifiable":
            return "Verify";
        case "pending":
        default:
            return (
                ACTION_BUTTON_LABELS[quest.actionType as ActionType] ||
                formatActionType(quest.actionType)
            );
    }
}

/**
 * ActionType을 읽기 쉬운 형태로 변환
 */
function formatActionType(actionType: string): string {
    const underscoreIndex = actionType.indexOf("_");
    const textPart =
        underscoreIndex !== -1
            ? actionType.slice(underscoreIndex + 1)
            : actionType;

    return textPart
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Quest의 현재 UI 상태 계산
 */
function getQuestUIState(
    quest: Quest,
    verifiableActions: string[]
): QuestUIState {
    if (quest.status === "completed") return "completed";
    if (quest.status === "claimable") return "claimable";
    if (verifiableActions.includes(quest.actionType)) return "verifiable";
    return "pending";
}

/**
 * Quest 정렬: claimable → verifiable → pending → completed
 */
function sortQuests(quests: Quest[], verifiableActions: string[]): Quest[] {
    return [...quests].sort((a, b) => {
        const getOrder = (q: Quest) => {
            // completed는 항상 맨 밑
            if (q.status === "completed") return 3;
            if (q.status === "claimable") return 0;
            if (verifiableActions.includes(q.actionType)) return 1;
            return 2; // pending
        };
        return getOrder(a) - getOrder(b);
    });
}

// =============================================================================
// Component
// =============================================================================

export default function QuestList({
    quests,
    verifiableActions = [],
    onAction,
    className,
    itemClassName,
    isLoading = false,
    error = null,
    skeletonCount = 3,
    variant = "light",
}: QuestListProps) {
    const sortedQuests = useMemo(
        () => sortQuests(quests, verifiableActions),
        [quests, verifiableActions]
    );

    // Loading state
    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <QuestItemSkeleton key={i} variant={variant} />
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        const textColor = variant === "dark" ? "text-red-300" : "text-red-500";
        return <div className={`text-center py-8 ${textColor}`}>{error}</div>;
    }

    // Empty state
    if (quests.length === 0) {
        return <QuestEmptyState variant={variant} />;
    }

    // Quest list
    return (
        <div className={className}>
            {sortedQuests.map((quest, index) => {
                const uiState = getQuestUIState(quest, verifiableActions);

                return (
                    <QuestItem
                        key={quest.actionType || index}
                        title={quest.title}
                        content={quest.description || ""}
                        buttonName={getButtonLabel(quest, uiState)}
                        point={quest.rewardAmount}
                        isCompleted={uiState === "completed"}
                        isClaimable={uiState === "claimable"}
                        isVerifiable={uiState === "verifiable"}
                        actionType={quest.actionType}
                        onAction={() => onAction(quest)}
                        className={itemClassName}
                    />
                );
            })}
        </div>
    );
}
