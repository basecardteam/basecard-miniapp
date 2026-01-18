"use client";

import { TwitterConnectStatus } from "@/features/mint/components/TwitterConnect";
import {
    clearStoredTokens,
    generateAuthUrl,
    generatePKCE,
    generateState,
    getCurrentTwitterUser,
    getOAuthConfig,
    saveOAuthState,
    TwitterUser,
} from "@/lib/api/twitter";
import { useCallback, useEffect, useRef, useState } from "react";

const OAUTH_RESULT_KEY = "twitter_oauth_result";

interface UseTwitterAuthOptions {
    /** form의 x 필드를 업데이트하는 함수 */
    onUsernameChange?: (username: string) => void;
    /** 초기 username (Edit 화면에서 기존 값 표시용) */
    initialUsername?: string;
}

interface UseTwitterAuthReturn {
    status: TwitterConnectStatus;
    username: string | undefined;
    error: string | undefined;
    connect: () => Promise<void>;
    disconnect: () => void;
}

interface OAuthResult {
    success: boolean;
    user?: TwitterUser;
    error?: string;
}

export function useTwitterAuth(
    options: UseTwitterAuthOptions = {}
): UseTwitterAuthReturn {
    const { onUsernameChange, initialUsername } = options;

    const [status, setStatus] = useState<TwitterConnectStatus>(() =>
        initialUsername ? "connected" : "disconnected"
    );
    const [username, setUsername] = useState<string | undefined>(initialUsername);
    const [error, setError] = useState<string | undefined>();
    const isConnectingRef = useRef(false);

    // Ref로 콜백 저장하여 의존성 제거
    const onUsernameChangeRef = useRef(onUsernameChange);
    useEffect(() => {
        onUsernameChangeRef.current = onUsernameChange;
    });

    // OAuth 결과 처리 함수 - 의존성 없음
    const handleOAuthResult = useCallback((result: OAuthResult) => {
        if (result.success && result.user) {
            setStatus("connected");
            setUsername(result.user.username);
            onUsernameChangeRef.current?.(result.user.username);
        } else {
            setStatus("disconnected");
            setError(result.error || "연결에 실패했습니다.");
        }
        isConnectingRef.current = false;
    }, []);

    // localStorage에서 OAuth 결과 확인 또는 토큰 확인 - 의존성 없음
    const checkLocalStorageResult = useCallback(async () => {
        if (!isConnectingRef.current) return;

        // 먼저 OAuth 결과 확인
        const stored = localStorage.getItem(OAUTH_RESULT_KEY);
        if (stored) {
            localStorage.removeItem(OAUTH_RESULT_KEY);
            try {
                const result: OAuthResult = JSON.parse(stored);
                handleOAuthResult(result);
                return;
            } catch {
                // JSON parse error
            }
        }

        // OAuth 결과가 없으면 토큰이 저장되었는지 확인 (다른 탭에서 처리된 경우)
        const user = await getCurrentTwitterUser();
        if (user) {
            handleOAuthResult({ success: true, user });
        }
    }, [handleOAuthResult]);

    // postMessage 리스너 (팝업에서 직접 메시지 전송)
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === "TWITTER_AUTH_SUCCESS" && event.data.user) {
                handleOAuthResult({ success: true, user: event.data.user });
            }
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleOAuthResult]);

    // 페이지 포커스 시 localStorage 확인 (모바일 리다이렉트 플로우)
    useEffect(() => {
        function handleFocus() {
            checkLocalStorageResult();
        }

        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                checkLocalStorageResult();
            }
        }

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [checkLocalStorageResult]);

    // 초기 로드 시 저장된 토큰 확인 및 localStorage 결과 확인
    useEffect(() => {
        async function checkExistingAuth() {
            // localStorage에서 OAuth 결과 확인 (리다이렉트로 돌아온 경우)
            const stored = localStorage.getItem(OAUTH_RESULT_KEY);
            if (stored) {
                localStorage.removeItem(OAUTH_RESULT_KEY);
                try {
                    const result: OAuthResult = JSON.parse(stored);
                    if (result.success && result.user) {
                        setStatus("connected");
                        setUsername(result.user.username);
                        onUsernameChangeRef.current?.(result.user.username);
                        return;
                    }
                } catch {
                    // JSON parse error
                }
            }

            // initialUsername이 있으면 그대로 사용
            if (initialUsername) {
                setStatus("connected");
                setUsername(initialUsername);
                return;
            }

            // 저장된 토큰으로 사용자 정보 확인
            const user = await getCurrentTwitterUser();
            if (user) {
                setStatus("connected");
                setUsername(user.username);
                onUsernameChangeRef.current?.(user.username);
            }
        }

        checkExistingAuth();
    }, [initialUsername]);

    const connect = useCallback(async () => {
        setError(undefined);
        setStatus("connecting");
        isConnectingRef.current = true;

        try {
            // PKCE 파라미터 생성
            const config = getOAuthConfig();
            const pkceParams = await generatePKCE();
            const state = generateState();

            // OAuth state 저장 (콜백에서 검증용)
            saveOAuthState({
                codeVerifier: pkceParams.codeVerifier,
                state,
            });

            // 인증 URL 생성 및 팝업/탭 열기
            const authUrl = generateAuthUrl(config, pkceParams, state);

            // 팝업 열기 (모바일에서는 새 탭으로 열림)
            const POPUP_WIDTH = 600;
            const POPUP_HEIGHT = 700;
            const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
            const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

            window.open(
                authUrl,
                "twitter-oauth",
                `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`
            );

            // 결과는 postMessage 또는 localStorage를 통해 수신
            // (팝업이 닫히면 focus 이벤트로 localStorage 확인)
        } catch (err) {
            setStatus("disconnected");
            setError(err instanceof Error ? err.message : "연결에 실패했습니다.");
            isConnectingRef.current = false;
        }
    }, []);

    const disconnect = useCallback(() => {
        clearStoredTokens();
        setStatus("disconnected");
        setUsername(undefined);
        setError(undefined);
        onUsernameChangeRef.current?.("");
    }, []);

    return {
        status,
        username,
        error,
        connect,
        disconnect,
    };
}
