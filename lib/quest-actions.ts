"use client";

import { upsertMiniAppAdded, upsertNotificationToken } from "@/lib/api/users";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { SocialKey } from "@/lib/types/api";
import { sdk } from "@farcaster/miniapp-sdk";
import { generateBaseCardShareURL } from "./qrCodeGenerator";

/**
 * Quest Action System
 *
 * 액션 타입 상수와 핸들러를 정의합니다.
 */

// =============================================================================
// Action Type Constants
// =============================================================================

export const ACTION_TYPES = {
    // Farcaster Actions
    FC_FOLLOW: "FC_FOLLOW",
    FC_SHARE: "FC_SHARE",
    FC_POST_HASHTAG: "FC_POST_HASHTAG",
    FC_LINK: "FC_LINK",

    // X (Twitter) Actions
    X_FOLLOW: "X_FOLLOW",
    X_LINK: "X_LINK",

    // App Actions
    APP_ADD_MINIAPP: "APP_ADD_MINIAPP",
    APP_NOTIFICATION: "APP_NOTIFICATION",
    APP_REFERRAL: "APP_REFERRAL",
    APP_BASECARD_MINT: "APP_BASECARD_MINT",
    APP_BIO_UPDATE: "APP_BIO_UPDATE",
    APP_SKILL_TAG: "APP_SKILL_TAG",
    APP_DAILY_CHECKIN: "APP_DAILY_CHECKIN",
    APP_VOTE: "APP_VOTE",
    APP_MANUAL: "APP_MANUAL",

    // Social Link Actions
    GH_LINK: "GH_LINK",
    LI_LINK: "LI_LINK",
    BASE_LINK_NAME: "BASE_LINK_NAME",
    WEB_LINK: "WEB_LINK",
} as const;

export type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

// =============================================================================
// Button Labels (UI에서 사용)
// =============================================================================

export const ACTION_BUTTON_LABELS: Partial<Record<ActionType, string>> = {
    [ACTION_TYPES.FC_LINK]: "Link",
    [ACTION_TYPES.FC_SHARE]: "Share",
    [ACTION_TYPES.FC_FOLLOW]: "Follow",
    [ACTION_TYPES.FC_POST_HASHTAG]: "Post",
    [ACTION_TYPES.X_LINK]: "Link",
    [ACTION_TYPES.X_FOLLOW]: "Follow",
    [ACTION_TYPES.APP_NOTIFICATION]: "Enable",
    [ACTION_TYPES.APP_DAILY_CHECKIN]: "Check In",
    [ACTION_TYPES.APP_BASECARD_MINT]: "Mint",
    [ACTION_TYPES.APP_ADD_MINIAPP]: "Add",
    [ACTION_TYPES.APP_REFERRAL]: "Invite",
    [ACTION_TYPES.APP_BIO_UPDATE]: "Update",
    [ACTION_TYPES.APP_SKILL_TAG]: "Add",
    [ACTION_TYPES.APP_VOTE]: "Vote",
    [ACTION_TYPES.APP_MANUAL]: "Complete",
    [ACTION_TYPES.GH_LINK]: "Link",
    [ACTION_TYPES.LI_LINK]: "Link",
    [ACTION_TYPES.BASE_LINK_NAME]: "Link",
    [ACTION_TYPES.WEB_LINK]: "Link",
};

// =============================================================================
// Client FID Constants
// =============================================================================

export const FARCASTER_CLIENT_FID = 9152;
export const BASE_APP_CLIENT_FID = 309857;
export const BASECARD_TEAM_FID = 1459788;

// =============================================================================
// Action Type Classifications
// =============================================================================

/**
 * 외부 액션: 외부 앱으로 이동 후 복귀 시 verify 필요
 */
export const EXTERNAL_ACTIONS: readonly ActionType[] = [];

/**
 * 즉시 완료 액션: 실행 즉시 결과를 알 수 있음
 */
export const IMMEDIATE_ACTIONS: readonly ActionType[] = [
    ACTION_TYPES.APP_ADD_MINIAPP,
    ACTION_TYPES.APP_NOTIFICATION,
    ACTION_TYPES.FC_FOLLOW,
    ACTION_TYPES.FC_SHARE,
    ACTION_TYPES.FC_POST_HASHTAG,
    ACTION_TYPES.X_FOLLOW,
];

/**
 * 라우팅 액션: 다른 페이지로 이동만 함
 */
export const ROUTE_ACTIONS: Partial<Record<ActionType, string>> = {
    [ACTION_TYPES.APP_BIO_UPDATE]: "/edit-profile",
    [ACTION_TYPES.APP_SKILL_TAG]: "/edit-profile",
    [ACTION_TYPES.FC_LINK]: "/edit-profile",
    [ACTION_TYPES.GH_LINK]: "/edit-profile",
    [ACTION_TYPES.LI_LINK]: "/edit-profile",
    [ACTION_TYPES.X_LINK]: "/edit-profile",
    [ACTION_TYPES.BASE_LINK_NAME]: "/edit-profile",
    [ACTION_TYPES.WEB_LINK]: "/edit-profile",
};

/**
 * 소셜 링크 액션: 프로필에서 링크 추가 필요
 */
export const SOCIAL_LINK_ACTIONS: readonly ActionType[] = [
    ACTION_TYPES.FC_LINK,
    ACTION_TYPES.GH_LINK,
    ACTION_TYPES.LI_LINK,
    ACTION_TYPES.X_LINK,
    ACTION_TYPES.BASE_LINK_NAME,
    ACTION_TYPES.WEB_LINK,
];

/**
 * 자동 Verifiable 액션: 조건 충족 시 자동으로 verify 버튼 표시
 * (e.g., card 있으면 APP_BASECARD_MINT는 verifiable)
 */
export const AUTO_VERIFIABLE_ACTIONS: Partial<
    Record<ActionType, (ctx: VerifiableContext) => boolean>
> = {
    [ACTION_TYPES.APP_BASECARD_MINT]: (ctx) => !!ctx.hasCard,
    // Social links: 이미 링크됐으면 verifiable
    [ACTION_TYPES.FC_LINK]: (ctx) => !!ctx.socials?.farcaster,
    [ACTION_TYPES.GH_LINK]: (ctx) => !!ctx.socials?.github,
    [ACTION_TYPES.LI_LINK]: (ctx) => !!ctx.socials?.linkedin,
    [ACTION_TYPES.X_LINK]: (ctx) => !!ctx.socials?.x,
    [ACTION_TYPES.BASE_LINK_NAME]: (ctx) => !!ctx.socials?.basename,
    [ACTION_TYPES.WEB_LINK]: (ctx) => !!ctx.socials?.website,
};

export interface VerifiableContext {
    hasCard?: boolean;
    socials?: Partial<Record<SocialKey, string>>;
}

/**
 * actionType → social key 매핑
 */
export const ACTION_TO_SOCIAL_KEY: Partial<Record<ActionType, SocialKey>> = {
    [ACTION_TYPES.GH_LINK]: "github",
    [ACTION_TYPES.LI_LINK]: "linkedin",
    [ACTION_TYPES.X_LINK]: "x",
    [ACTION_TYPES.FC_LINK]: "farcaster",
    [ACTION_TYPES.WEB_LINK]: "website",
    [ACTION_TYPES.BASE_LINK_NAME]: "basename",
};

// =============================================================================
// Types
// =============================================================================

export interface QuestActionContext {
    address?: string;
    accessToken?: string;
    cardId?: string;
    cardImageUri?: string;
    isInMiniApp: boolean;
    clientContext?: {
        clientFid: number;
    };
}

export interface ActionResult {
    success: boolean;
    shouldVerifyImmediately?: boolean;
    shouldSetPending?: boolean;
    navigateTo?: string;
    error?: string;
    data?: unknown;
}

// =============================================================================
// Type Guards
// =============================================================================

export const isExternalAction = (actionType: string): boolean => {
    return (EXTERNAL_ACTIONS as readonly string[]).includes(actionType);
};

export const isImmediateAction = (actionType: string): boolean => {
    return (IMMEDIATE_ACTIONS as readonly string[]).includes(actionType);
};

export const isRouteAction = (actionType: string): boolean => {
    return actionType in ROUTE_ACTIONS;
};

export const isSocialLinkAction = (actionType: string): boolean => {
    return (SOCIAL_LINK_ACTIONS as readonly string[]).includes(actionType);
};

export const getRouteForAction = (actionType: string): string | null => {
    return ROUTE_ACTIONS[actionType as ActionType] ?? null;
};

/**
 * Check auto-verifiable actions
 */
export const getAutoVerifiableActions = (
    ctx: VerifiableContext
): ActionType[] => {
    return Object.entries(AUTO_VERIFIABLE_ACTIONS)
        .filter(([, check]) => check && check(ctx))
        .map(([actionType]) => actionType as ActionType);
};

// =============================================================================
// Action Handlers
// =============================================================================

const handleFcFollow = async (): Promise<ActionResult> => {
    try {
        await sdk.actions.viewProfile({ fid: BASECARD_TEAM_FID });
        return { success: true, shouldSetPending: true };
    } catch {
        window.open("https://warpcast.com/basecardteam", "_blank");
        return { success: true, shouldSetPending: true };
    }
};

const handleFcShare = async (
    ctx: QuestActionContext
): Promise<ActionResult> => {
    if (!ctx.cardId) {
        return { success: false, error: "No cardId provided for share" };
    }
    const shareUrl = generateBaseCardShareURL(ctx.cardId);
    const result = await shareToFarcaster({ embedUrl: shareUrl });
    console.log("[handleFcShare] result: ", result);
    return { success: true, shouldSetPending: true };
};

const handleXFollow = async (
    ctx: QuestActionContext
): Promise<ActionResult> => {
    const xUrl = "https://x.com/basecardteam";
    if (ctx.isInMiniApp) {
        try {
            await sdk.actions.openUrl({ url: xUrl });
        } catch {
            window.open(xUrl, "_blank");
        }
    } else {
        window.open(xUrl, "_blank");
    }
    return { success: true, shouldSetPending: true };
};

const handleAppNotification = async (
    ctx: QuestActionContext
): Promise<ActionResult> => {
    try {
        const result = await sdk.actions.addMiniApp();
        const miniappCtx = await sdk.context;
        console.log("[handleAppNotification] result: ", result);
        console.log(
            "[handleAppNotification] miniappCtx: ",
            miniappCtx.client.notificationDetails
        );
        if (
            result &&
            miniappCtx.client.notificationDetails &&
            ctx.accessToken
        ) {
            try {
                await upsertNotificationToken(
                    ctx.accessToken,
                    miniappCtx.client.notificationDetails,
                    ctx.clientContext!.clientFid
                );
                console.log("Notification token saved");
            } catch (error) {
                console.error("Failed to save notification token:", error);
                // Continue even if token save fails
                return {
                    success: true,
                    shouldSetPending: false,
                };
            }

            return {
                success: true,
                shouldSetPending: true,
            };
        }
        return { success: false, error: "Failed to add miniapp" };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

const handleAppAddMiniapp = async (
    ctx: QuestActionContext
): Promise<ActionResult> => {
    try {
        const result = await sdk.actions.addMiniApp();
        const miniappCtx = await sdk.context;
        if (result && miniappCtx.client.added) {
            // Mark miniapp as added via API
            if (ctx.accessToken && ctx.clientContext?.clientFid) {
                try {
                    await upsertMiniAppAdded(
                        ctx.accessToken,
                        ctx.clientContext.clientFid
                    );
                    console.log("Miniapp added marked on server");
                } catch (error) {
                    console.error("Failed to mark miniapp added:", error);
                    // Continue even if API call fails
                }
            }

            return {
                success: true,
                shouldSetPending: true,
            };
        }
        return { success: false, error: "Failed to add miniapp" };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

const handleAppReferral = async (
    ctx: QuestActionContext
): Promise<ActionResult> => {
    const baseUrl =
        process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app";
    const referralUrl = ctx.address ? `${baseUrl}?ref=${ctx.address}` : baseUrl;

    await shareToFarcaster({
        text: "Join Basecard and build your on-chain profile!",
        embedUrl: referralUrl,
    });
    return { success: true };
};

// =============================================================================
// Action Handlers Registry
// =============================================================================

type ActionHandler = (ctx: QuestActionContext) => Promise<ActionResult>;

export const ACTION_HANDLERS: Partial<Record<ActionType, ActionHandler>> = {
    [ACTION_TYPES.FC_FOLLOW]: handleFcFollow,
    [ACTION_TYPES.FC_SHARE]: handleFcShare,
    [ACTION_TYPES.FC_POST_HASHTAG]: handleFcShare,
    [ACTION_TYPES.X_FOLLOW]: handleXFollow,
    [ACTION_TYPES.APP_ADD_MINIAPP]: handleAppAddMiniapp,
    [ACTION_TYPES.APP_NOTIFICATION]: handleAppNotification,
    [ACTION_TYPES.APP_REFERRAL]: handleAppReferral,
};

export const executeAction = async (
    actionType: string,
    ctx: QuestActionContext
): Promise<ActionResult> => {
    // 1. Check Route Actions
    const route = ROUTE_ACTIONS[actionType as ActionType];
    if (route) {
        return { success: true, navigateTo: route };
    }

    // 2. Check Action Handlers
    const handler = ACTION_HANDLERS[actionType as ActionType];
    if (!handler) {
        return { success: false, error: `Unknown action type: ${actionType}` };
    }
    return handler(ctx);
};

// =============================================================================
// Utility Functions
// =============================================================================

export const isSocialLinked = (
    actionType: string,
    socials: Partial<Record<SocialKey, string>>
): boolean => {
    const socialKey = ACTION_TO_SOCIAL_KEY[actionType as ActionType];
    if (!socialKey) return false;
    return !!socials[socialKey];
};

// =============================================================================
// Platform Detection
// =============================================================================

export type ClientApp = "farcaster" | "base" | "unknown";

export const getClientApp = (clientFid?: number): ClientApp => {
    if (!clientFid) return "unknown";
    switch (clientFid) {
        case FARCASTER_CLIENT_FID:
            return "farcaster";
        case BASE_APP_CLIENT_FID:
            return "base";
        default:
            return "unknown";
    }
};
