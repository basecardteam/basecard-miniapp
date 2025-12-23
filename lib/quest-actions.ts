"use client";

import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Quest Action Handlers Library
 *
 * 각 퀘스트 actionType별로 onClick 핸들러를 정의합니다.
 * 새로운 액션을 추가하려면 QUEST_ACTIONS 객체에 추가하세요.
 */

// =============================================================================
// Constants
// =============================================================================

/** Farcaster 클라이언트 FID */
export const FARCASTER_CLIENT_FID = 9152;

/** Base App 클라이언트 FID */
export const BASE_APP_CLIENT_FID = 309857;

/** BaseCard 팀 FID */
export const BASECARD_TEAM_FID = 1459788;

/** 지원되는 클라이언트 앱 타입 */
export type ClientApp = "farcaster" | "base" | "unknown";

// =============================================================================
// Platform Detection
// =============================================================================

/**
 * clientFid를 기반으로 현재 클라이언트 앱을 판별합니다.
 * @param clientFid - FrameContext의 client.clientFid
 */
export function getClientApp(clientFid?: number): ClientApp {
    if (!clientFid) return "unknown";

    switch (clientFid) {
        case FARCASTER_CLIENT_FID:
            return "farcaster";
        case BASE_APP_CLIENT_FID:
            return "base";
        default:
            return "unknown";
    }
}

/**
 * 현재 클라이언트가 Base 앱인지 확인합니다.
 */
export function isBaseApp(clientFid?: number): boolean {
    return getClientApp(clientFid) === "base";
}

/**
 * 현재 클라이언트가 Farcaster 앱인지 확인합니다.
 */
export function isFarcasterApp(clientFid?: number): boolean {
    return getClientApp(clientFid) === "farcaster";
}

// =============================================================================
// Quest Action Handlers
// =============================================================================

export interface QuestActionContext {
    /** 클라이언트 FID (from FrameContext.client.clientFid) */
    clientFid?: number;
    /** 유저 FID (from FrameContext.user.fid) */
    userFid?: number;
    /** 유저 username (from FrameContext.user.username) */
    username?: string;
    /** 유저 지갑 주소 */
    address?: string;
}

export type QuestActionHandler = (
    context: QuestActionContext
) => void | Promise<void>;

// =============================================================================
// Action Implementations
// =============================================================================

/**
 * FC_FOLLOW: SDK viewProfile로 BaseCard 팀 프로필 보기
 * 플랫폼에 관계없이 SDK가 알아서 처리
 */
export async function handleFcFollow(): Promise<void> {
    try {
        await sdk.actions.viewProfile({ fid: BASECARD_TEAM_FID });
    } catch {
        // Fallback to Warpcast URL if SDK fails
        window.open("https://warpcast.com/basecardteam", "_blank");
    }
}

/**
 * APP_ADD_MINIAPP: 미니앱을 홈 화면에 추가
 * SDK addMiniApp 호출
 * @returns 성공 여부, 앱 추가 여부, 알림 활성화 여부
 */
export interface AddMiniAppResult {
    success: boolean;
    isAppAdded: boolean;
    hasNotifications: boolean;
    notificationDetails?: { url: string; token: string } | null;
    error?: string;
}

export async function handleAppAddMiniapp(): Promise<AddMiniAppResult> {
    try {
        const result = await sdk.actions.addMiniApp();
        console.log("addMiniApp response", result);

        // Check if notificationDetails were included
        // Note: result might be undefined if user rejects or in web environment
        if (result && result.notificationDetails) {
            return {
                success: true,
                isAppAdded: true,
                hasNotifications: true,
                notificationDetails: result.notificationDetails,
            };
        } else if (result) {
            // App added but notifications not enabled
            return {
                success: true,
                isAppAdded: true,
                hasNotifications: false,
                notificationDetails: null,
            };
        } else {
            // Result is undefined - user might have rejected
            return {
                success: false,
                isAppAdded: false,
                hasNotifications: false,
                notificationDetails: null,
            };
        }
    } catch (error) {
        console.error("Failed to add mini app:", error);
        return {
            success: false,
            isAppAdded: false,
            hasNotifications: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * FC_SHARE: Farcaster에서 공유하기
 */
export function handleFcShare(ctx: QuestActionContext): void {
    const shareUrl = encodeURIComponent(
        `${window.location.origin}/basecard/${ctx.address}`
    );
    const url = `https://warpcast.com/~/compose?text=Check%20out%20my%20BaseCard!&embeds[]=${shareUrl}`;
    window.open(url, "_blank");
}

/**
 * X_FOLLOW: Twitter 팔로우
 */
export function handleXFollow(): void {
    // BaseCard 공식 트위터 팔로우
    window.open("https://x.com/basecard_xyz", "_blank");
}

// =============================================================================
// Quest Actions Registry
// =============================================================================

/**
 * actionType별 핸들러 매핑
 *
 * 새로운 퀘스트 액션을 추가하려면 여기에 추가하세요:
 * 1. 위에 handleXXX 함수 정의
 * 2. 아래 QUEST_ACTION_HANDLERS에 actionType: handler 추가
 */
export const QUEST_ACTION_HANDLERS: Partial<
    Record<string, QuestActionHandler>
> = {
    // Farcaster Actions
    FC_FOLLOW: handleFcFollow,
    FC_SHARE: handleFcShare,

    // Twitter Actions
    X_FOLLOW: handleXFollow,

    // 추가 예정:
    // FC_LINK: handleFcLink,
    // FC_POST_HASHTAG: handleFcPostHashtag,
    // APP_NOTIFICATION: handleAppNotification,
    // ...
};

/**
 * actionType에 대한 핸들러가 정의되어 있는지 확인합니다.
 */
export function hasActionHandler(actionType: string): boolean {
    return !!QUEST_ACTION_HANDLERS[actionType];
}

/**
 * actionType에 해당하는 핸들러를 실행합니다.
 * @returns true if handler was executed, false if no handler found
 */
export function executeQuestAction(
    actionType: string,
    context: QuestActionContext
): boolean {
    const handler = QUEST_ACTION_HANDLERS[actionType];
    if (handler) {
        handler(context);
        return true;
    }
    return false;
}
