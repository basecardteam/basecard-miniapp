"use client";

import { GitHubConnectStatus } from "@/features/mint/components/GitHubConnect";
import {
    clearStoredTokens,
    generateAuthUrl,
    generateState,
    getCurrentGitHubUser,
    getOAuthConfig,
    GitHubUser,
    saveOAuthState,
} from "@/lib/api/github";
import { useCallback, useEffect, useRef, useState } from "react";

const OAUTH_RESULT_KEY = "github_oauth_result";

interface UseGitHubAuthOptions {
    /** form의 github 필드를 업데이트하는 함수 */
    onUsernameChange?: (username: string) => void;
    /** 초기 username (Edit 화면에서 기존 값 표시용) */
    initialUsername?: string;
}

interface UseGitHubAuthReturn {
    status: GitHubConnectStatus;
    username: string | undefined;
    error: string | undefined;
    connect: () => Promise<void>;
    disconnect: () => void;
}

interface OAuthResult {
    success: boolean;
    user?: GitHubUser;
    error?: string;
}

export function useGitHubAuth(
    options: UseGitHubAuthOptions = {},
): UseGitHubAuthReturn {
    const { onUsernameChange, initialUsername } = options;

    const [status, setStatus] = useState<GitHubConnectStatus>(() =>
        initialUsername ? "connected" : "disconnected",
    );
    const [username, setUsername] = useState<string | undefined>(
        initialUsername,
    );
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
            setUsername(result.user.login);
            onUsernameChangeRef.current?.(result.user.login);
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
        const user = await getCurrentGitHubUser();
        if (user) {
            handleOAuthResult({ success: true, user });
        }
    }, [handleOAuthResult]);

    // postMessage 리스너
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === "GITHUB_AUTH_SUCCESS" && event.data.user) {
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
                const githubConnected = urlParams.get("github_connected");
                if (githubConnected) {
                    setStatus("connected");
                    setUsername(githubConnected);
                    onUsernameChangeRef.current?.(githubConnected);
                    // URL 파라미터 제거 (히스토리 교체)
                    urlParams.delete("github_connected");
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
                        setUsername(result.user.login);
                        onUsernameChangeRef.current?.(result.user.login);
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

            const user = await getCurrentGitHubUser();
            if (user) {
                setStatus("connected");
                setUsername(user.login);
                onUsernameChangeRef.current?.(user.login);
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

            // OAuth state 저장 (콜백에서 검증용 + 돌아갈 URL)
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
                "github-oauth",
                `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`,
            );

            // 결과는 postMessage 또는 localStorage를 통해 수신
            // (팝업이 닫히면 focus 이벤트로 localStorage 확인)
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
