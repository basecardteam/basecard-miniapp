"use client";

import { LinkedInConnectStatus } from "@/features/mint/components/LinkedInConnect";
import {
    clearStoredTokens,
    generateAuthUrl,
    generateState,
    getCurrentLinkedInUser,
    getOAuthConfig,
    LinkedInUser,
    saveOAuthState,
} from "@/lib/api/linkedin";
import { useCallback, useEffect, useRef, useState } from "react";

const OAUTH_RESULT_KEY = "linkedin_oauth_result";

interface UseLinkedInAuthOptions {
    /** form의 linkedin 필드를 업데이트하는 함수 */
    onUsernameChange?: (username: string) => void;
    /** 초기 username (Edit 화면에서 기존 값 표시용) */
    initialUsername?: string;
}

interface UseLinkedInAuthReturn {
    status: LinkedInConnectStatus;
    username: string | undefined;
    displayName: string | undefined;
    error: string | undefined;
    connect: () => Promise<void>;
    disconnect: () => void;
}

interface OAuthResult {
    success: boolean;
    user?: LinkedInUser;
    error?: string;
}

export function useLinkedInAuth(
    options: UseLinkedInAuthOptions = {},
): UseLinkedInAuthReturn {
    const { onUsernameChange, initialUsername } = options;

    const [status, setStatus] = useState<LinkedInConnectStatus>(() =>
        initialUsername ? "connected" : "disconnected",
    );
    const [username, setUsername] = useState<string | undefined>(
        initialUsername,
    );
    const [displayName, setDisplayName] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();
    const isConnectingRef = useRef(false);

    // Ref로 콜백 저장하여 의존성 제거
    const onUsernameChangeRef = useRef(onUsernameChange);
    useEffect(() => {
        onUsernameChangeRef.current = onUsernameChange;
    });

    // OAuth 결과 처리 함수
    const handleOAuthResult = useCallback((result: OAuthResult) => {
        if (result.success && result.user) {
            setStatus("connected");
            // LinkedIn은 sub (member ID)를 username으로 사용
            setUsername(result.user.sub);
            setDisplayName(result.user.name);
            onUsernameChangeRef.current?.(result.user.sub);
        } else {
            setStatus("disconnected");
            setError(result.error || "연결에 실패했습니다.");
        }
        isConnectingRef.current = false;
    }, []);

    // localStorage에서 OAuth 결과 확인
    const checkLocalStorageResult = useCallback(async () => {
        if (!isConnectingRef.current) return;

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

        // 토큰이 저장되었는지 확인
        const user = await getCurrentLinkedInUser();
        if (user) {
            handleOAuthResult({ success: true, user });
        }
    }, [handleOAuthResult]);

    // postMessage 리스너
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return;
            if (
                event.data?.type === "LINKEDIN_AUTH_SUCCESS" &&
                event.data.user
            ) {
                handleOAuthResult({ success: true, user: event.data.user });
            }
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleOAuthResult]);

    // 페이지 포커스 시 localStorage 확인
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
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [checkLocalStorageResult]);

    // 초기 로드 시 저장된 토큰 또는 URL 파라미터 확인
    useEffect(() => {
        async function checkExistingAuth() {
            // URL 파라미터에서 MiniApp 콜백 결과 확인
            if (typeof window !== "undefined") {
                const urlParams = new URLSearchParams(window.location.search);
                const linkedinConnected = urlParams.get("linkedin_connected");
                const linkedinName = urlParams.get("linkedin_name");
                if (linkedinConnected) {
                    setStatus("connected");
                    setUsername(linkedinConnected);
                    setDisplayName(linkedinName || undefined);
                    onUsernameChangeRef.current?.(linkedinConnected);
                    // URL 파라미터 제거 (히스토리 교체)
                    urlParams.delete("linkedin_connected");
                    urlParams.delete("linkedin_name");
                    const newUrl = urlParams.toString()
                        ? `${window.location.pathname}?${urlParams.toString()}`
                        : window.location.pathname;
                    window.history.replaceState({}, "", newUrl);
                    return;
                }
            }

            const stored = localStorage.getItem(OAUTH_RESULT_KEY);
            if (stored) {
                localStorage.removeItem(OAUTH_RESULT_KEY);
                try {
                    const result: OAuthResult = JSON.parse(stored);
                    if (result.success && result.user) {
                        setStatus("connected");
                        setUsername(result.user.sub);
                        setDisplayName(result.user.name);
                        onUsernameChangeRef.current?.(result.user.sub);
                        return;
                    }
                } catch {
                    // JSON parse error
                }
            }

            if (initialUsername) {
                setStatus("connected");
                setUsername(initialUsername);
                return;
            }

            const user = await getCurrentLinkedInUser();
            if (user) {
                setStatus("connected");
                setUsername(user.sub);
                setDisplayName(user.name);
                onUsernameChangeRef.current?.(user.sub);
            }
        }

        checkExistingAuth();
    }, [initialUsername]);

    const connect = useCallback(async () => {
        setError(undefined);
        setStatus("connecting");
        isConnectingRef.current = true;

        try {
            const config = getOAuthConfig();
            const state = generateState();

            saveOAuthState({
                state,
                returnUrl: window.location.pathname,
            });

            const authUrl = generateAuthUrl(config, state);

            // 팝업 열기 (모바일에서는 새 탭으로 열림)
            const POPUP_WIDTH = 600;
            const POPUP_HEIGHT = 700;
            const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
            const top =
                window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

            window.open(
                authUrl,
                "linkedin-oauth",
                `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`,
            );

            // 결과는 postMessage 또는 localStorage를 통해 수신
        } catch (err) {
            setStatus("disconnected");
            setError(
                err instanceof Error ? err.message : "연결에 실패했습니다.",
            );
            isConnectingRef.current = false;
        }
    }, []);

    const disconnect = useCallback(() => {
        clearStoredTokens();
        setStatus("disconnected");
        setUsername(undefined);
        setDisplayName(undefined);
        setError(undefined);
        onUsernameChangeRef.current?.("");
    }, []);

    return {
        status,
        username,
        displayName,
        error,
        connect,
        disconnect,
    };
}
