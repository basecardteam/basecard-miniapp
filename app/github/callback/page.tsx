"use client";

import {
    clearOAuthState,
    exchangeCodeForToken,
    getGitHubUser,
    getOAuthConfig,
    getOAuthState,
    saveTokens,
} from "@/lib/api/github";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa6";

interface CallbackState {
    status: "loading" | "success" | "error";
    username: string;
    errorMessage: string;
    returnUrl?: string;
}

function GitHubCallbackContent() {
    const searchParams = useSearchParams();

    const params = useMemo(
        () => ({
            code: searchParams.get("code"),
            oauthState: searchParams.get("state"),
            error: searchParams.get("error"),
            errorDescription: searchParams.get("error_description"),
        }),
        [searchParams],
    );

    const [callbackState, setCallbackState] = useState<CallbackState>({
        status: "loading",
        username: "",
        errorMessage: "",
        returnUrl: "/mint",
    });
    const isProcessingRef = useRef(false);

    useEffect(() => {
        async function handleCallback() {
            if (isProcessingRef.current) return;

            const { code, oauthState, error, errorDescription } = params;

            // 초기 return URL 설정 (에러 처리 시 사용)
            const savedState = getOAuthState();
            const initialReturnUrl = savedState?.returnUrl || "/mint";

            if (error) {
                isProcessingRef.current = true;
                setCallbackState({
                    status: "error",
                    username: "",
                    errorMessage:
                        errorDescription || error || "Authentication failed",
                    returnUrl: initialReturnUrl,
                });
                return;
            }

            if (!code || !oauthState) {
                return;
            }

            isProcessingRef.current = true;

            if (!savedState || savedState.state !== oauthState) {
                setCallbackState({
                    status: "error",
                    username: "",
                    errorMessage: "Session expired. Please try again.",
                    returnUrl: initialReturnUrl,
                });
                return;
            }

            try {
                const config = getOAuthConfig();
                const tokens = await exchangeCodeForToken(
                    code,
                    config.redirectUri,
                    config.clientId,
                );

                saveTokens(tokens);

                const user = await getGitHubUser(tokens.access_token);

                // 돌아갈 URL 저장 (clearOAuthState 전에)
                const returnUrl = savedState.returnUrl || "/mint";

                clearOAuthState();

                localStorage.setItem(
                    "github_oauth_result",
                    JSON.stringify({ success: true, user }),
                );

                setCallbackState({
                    status: "success",
                    username: user.login,
                    errorMessage: "",
                    returnUrl: returnUrl,
                });

                if (window.opener) {
                    window.opener.postMessage(
                        { type: "GITHUB_AUTH_SUCCESS", user },
                        window.location.origin,
                    );
                    setTimeout(() => window.close(), 800);
                } else {
                    setTimeout(() => {
                        window.location.href = returnUrl;
                    }, 1200);
                }
            } catch (err) {
                clearOAuthState();
                setCallbackState({
                    status: "error",
                    username: "",
                    errorMessage:
                        err instanceof Error
                            ? err.message
                            : "Authentication failed",
                    returnUrl: initialReturnUrl,
                });

                localStorage.setItem(
                    "github_oauth_result",
                    JSON.stringify({
                        success: false,
                        error:
                            err instanceof Error
                                ? err.message
                                : "Authentication failed",
                    }),
                );
            }
        }

        handleCallback();
    }, [params]);

    const { status, username, errorMessage, returnUrl } = callbackState;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center p-8 max-w-sm w-full">
                <div className="flex flex-col items-center gap-5">
                    {/* 로고 영역 */}
                    <div className="relative">
                        <div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-1000 ${
                                status === "error"
                                    ? "bg-gray-100"
                                    : "bg-[#24292e]"
                            } ${status === "loading" ? "animate-pulse" : ""}`}
                        >
                            <FaGithub
                                className={`w-10 h-10 transition-colors duration-500 ${
                                    status === "error"
                                        ? "text-gray-400"
                                        : "text-white"
                                }`}
                            />
                        </div>

                        {/* 에러 인디케이터 */}
                        {status === "error" && (
                            <div
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                                    flex items-center justify-center shadow-md bg-red-500"
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="space-y-1.5 min-h-[60px] flex flex-col items-center justify-center">
                        {status === "loading" && (
                            <>
                                <p className="text-lg font-semibold text-gray-900">
                                    Connecting to GitHub
                                </p>
                                <p className="text-sm text-gray-500">
                                    Please wait a moment...
                                </p>
                            </>
                        )}
                        {status === "success" && (
                            <>
                                <p className="text-lg font-semibold text-gray-900">
                                    Connected!
                                </p>
                                <p className="text-base text-basecard-blue font-medium">
                                    @{username}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Redirecting...
                                </p>
                            </>
                        )}
                        {status === "error" && (
                            <>
                                <p className="text-lg font-semibold text-gray-900">
                                    Connection Failed
                                </p>
                                <p className="text-sm text-gray-500">
                                    {errorMessage}
                                </p>
                            </>
                        )}
                    </div>

                    {/* 에러 시 버튼 */}
                    {status === "error" && (
                        <button
                            onClick={() =>
                                (window.location.href = returnUrl || "/mint")
                            }
                            className="mt-2 px-6 py-2.5 bg-[#24292e] text-white text-sm font-medium
                                rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function GitHubCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                    <div className="w-16 h-16 rounded-2xl bg-[#24292e] flex items-center justify-center shadow-lg animate-pulse">
                        <FaGithub className="w-8 h-8 text-white" />
                    </div>
                </div>
            }
        >
            <GitHubCallbackContent />
        </Suspense>
    );
}
