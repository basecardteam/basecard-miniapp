"use client";

import { useUser } from "@/hooks/api/useUser";
import { Quest, SocialKey } from "@/lib/types/api";
import { useMemo } from "react";
import QuestEmptyState from "./QuestEmptyState";
import QuestItem from "./QuestItem";
import QuestItemSkeleton from "./QuestItemSkeleton";

// Map actionType to social key for link quests
const ACTION_TO_SOCIAL_KEY: Record<string, SocialKey> = {
    GH_LINK: "github",
    LI_LINK: "linkedin",
    X_LINK: "x",
    FC_LINK: "farcaster",
    WEB_LINK: "website",
    BASE_LINK_NAME: "basename",
};

const BUTTON_LABELS: Record<string, string> = {
    // Farcaster
    FC_LINK: "Link",
    FC_SHARE: "Share",
    FC_FOLLOW: "Follow",
    FC_POST_HASHTAG: "Post",
    // Twitter
    X_LINK: "Link",
    X_FOLLOW: "Follow",
    // App
    APP_NOTIFICATION: "Enable",
    APP_DAILY_CHECKIN: "Check In",
    APP_BASECARD_MINT: "Mint",
    APP_ADD_MINIAPP: "Add",
    APP_REFERRAL: "Invite",
    APP_BIO_UPDATE: "Update",
    APP_SKILL_TAG: "Add",
    APP_VOTE: "Vote",
    APP_MANUAL: "Complete",
    // GitHub
    GH_LINK: "Link",
    // LinkedIn
    LI_LINK: "Link",
    // Basename
    BASE_LINK_NAME: "Link",
    // Website
    WEB_LINK: "Link",
};

function getButtonName(quest: Quest): string {
    if (quest.status === "completed") return "Claimed";
    if (quest.status === "claimable") return "Claim!";

    // Check if there's a predefined label
    if (BUTTON_LABELS[quest.actionType]) {
        return BUTTON_LABELS[quest.actionType];
    }

    // Remove prefix before first underscore and format as Title Case
    // e.g., "LINK_BASE_NAME" -> "Base Name", "LI_LINK" -> "Link"
    const actionType = quest.actionType;
    const underscoreIndex = actionType.indexOf("_");
    const textPart =
        underscoreIndex !== -1
            ? actionType.slice(underscoreIndex + 1)
            : actionType;

    // Convert to Title Case: "BASE_NAME" -> "Base Name"
    return textPart
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface QuestListProps {
    quests: Quest[];
    claimingQuest: string | null;
    verifyingActions?: string[];
    onAction: (quest: Quest) => void;
    className?: string;
    itemClassName?: string;
    isLoading?: boolean;
    error?: string | null;
    skeletonCount?: number;
    variant?: "light" | "dark";
}

export default function QuestList({
    quests,
    claimingQuest,
    verifyingActions = [],
    onAction,
    className,
    itemClassName,
    isLoading = false,
    error = null,
    skeletonCount = 3,
    variant = "light",
}: QuestListProps) {
    // Get user's socials for verifiable check
    const { card } = useUser();
    const userSocials = card?.socials ?? {};

    // Check if a quest is verifiable (pending + social linked)
    const isQuestVerifiable = (quest: Quest): boolean => {
        if (quest.status !== "pending") return false;
        const socialKey = ACTION_TO_SOCIAL_KEY[quest.actionType];
        if (!socialKey) return false;
        return !!userSocials[socialKey];
    };

    // Sort: claimable → pending → completed
    const sortedQuests = useMemo(() => {
        return [...quests].sort((a, b) => {
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
    }, [quests]);

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <QuestItemSkeleton key={i} variant={variant} />
                ))}
            </div>
        );
    }

    if (error) {
        const textColor = variant === "dark" ? "text-red-300" : "text-red-500";
        return <div className={`text-center py-8 ${textColor}`}>{error}</div>;
    }

    if (quests.length === 0) {
        return <QuestEmptyState variant={variant} />;
    }

    return (
        <div className={className}>
            {sortedQuests.map((quest, index) => {
                const verifiable = isQuestVerifiable(quest);
                return (
                    <QuestItem
                        key={quest.actionType || index}
                        title={quest.title}
                        content={quest.description || ""}
                        buttonName={
                            verifiable ? "Verify" : getButtonName(quest)
                        }
                        point={quest.rewardAmount}
                        isCompleted={quest.status === "completed"}
                        isClaimable={quest.status === "claimable"}
                        isVerifiable={verifiable}
                        isClaiming={claimingQuest === quest.actionType}
                        isVerifying={verifyingActions.includes(
                            quest.actionType
                        )}
                        actionType={quest.actionType}
                        onAction={() => onAction(quest)}
                        className={itemClassName}
                    />
                );
            })}
        </div>
    );
}
