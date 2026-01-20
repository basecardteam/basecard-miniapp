"use client";

import {
    clearOAuthState,
    exchangeCodeForToken,
    getOAuthConfig,
    getOAuthState,
    getTwitterUser,
    saveTokens,
} from "@/lib/api/twitter";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FaSquareXTwitter } from "react-icons/fa6";

// 단일 상태로 관리하여 한 번의 렌더로 처리
interface CallbackState {
    status: "loading" | "success" | "error";
    username: string;
    errorMessage: string;
}

function TwitterCallbackContent() {
    const searchParams = useSearchParams();

    // URL 파라미터를 한 번만 추출 (primitive values로 안정화)
    const params = useMemo(
        () => ({
            code: searchParams.get("code"),
            oauthState: searchParams.get("state"),
            error: searchParams.get("error"),
            errorDescription: searchParams.get("error_description"),
        }),
        [searchParams]
    );

    // 단일 상태 객체로 관리 - 한 번의 setState로 모든 값 업데이트
    const [callbackState, setCallbackState] = useState<CallbackState>({
        status: "loading",
        username: "",
        errorMessage: "",
    });
    const isProcessingRef = useRef(false);

    useEffect(() => {
        async function handleCallback() {
            if (isProcessingRef.current) return;

            const { code, oauthState, error, errorDescription } = params;

            if (error) {
                isProcessingRef.current = true;
                setCallbackState({
                    status: "error",
                    username: "",
                    errorMessage:
                        errorDescription || error || "Authentication failed",
                });
                return;
            }

            if (!code || !oauthState) {
                return;
            }

            isProcessingRef.current = true;

            const savedState = getOAuthState();
            if (!savedState || savedState.state !== oauthState) {
                setCallbackState({
                    status: "error",
                    username: "",
                    errorMessage: "Session expired. Please try again.",
                });
                return;
            }

            try {
                const config = getOAuthConfig();
                const tokens = await exchangeCodeForToken(
                    code,
                    savedState.codeVerifier,
                    config.redirectUri,
                    config.clientId
                );

                saveTokens(tokens);

                const user = await getTwitterUser(tokens.access_token);

                // 돌아갈 URL 저장 (clearOAuthState 전에)
                const returnUrl = savedState.returnUrl || "/mint";

                clearOAuthState();

                localStorage.setItem(
                    "twitter_oauth_result",
                    JSON.stringify({ success: true, user })
                );

                // 단일 setState로 모든 상태 업데이트 - 한 번의 렌더만 발생
                setCallbackState({
                    status: "success",
                    username: user.username,
                    errorMessage: "",
                });

                if (window.opener) {
                    window.opener.postMessage(
                        { type: "TWITTER_AUTH_SUCCESS", user },
                        window.location.origin
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
                });

                localStorage.setItem(
                    "twitter_oauth_result",
                    JSON.stringify({
                        success: false,
                        error:
                            err instanceof Error
                                ? err.message
                                : "Authentication failed",
                    })
                );
            }
        }

        handleCallback();
    }, [params]);

    const { status, username, errorMessage } = callbackState;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center p-8 max-w-sm w-full">
                {/* 공통 컨테이너 - 부드러운 전환 */}
                <div className="flex flex-col items-center gap-5">
                    {/* 로고 영역 - 항상 표시 */}
                    <div className="relative">
                        <div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-1000 ${
                                status === "error"
                                    ? "bg-gray-100"
                                    : "bg-black"
                            } ${status === "loading" ? "animate-pulse" : ""}`}
                        >
                            <FaSquareXTwitter
                                className={`w-10 h-10 transition-colors duration-500 ${
                                    status === "error"
                                        ? "text-gray-400"
                                        : "text-white"
                                }`}
                            />
                        </div>

                        {/* 에러 인디케이터만 표시 */}
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

                    {/* 텍스트 영역 - 상태별 전환 */}
                    <div className="space-y-1.5 min-h-[60px] flex flex-col items-center justify-center">
                        {status === "loading" && (
                            <>
                                <p className="text-lg font-semibold text-gray-900">
                                    Connecting to X
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
                            onClick={() => (window.location.href = "/mint")}
                            className="mt-2 px-6 py-2.5 bg-black text-white text-sm font-medium
                                rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TwitterCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                    <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg animate-pulse">
                        <FaSquareXTwitter className="w-8 h-8 text-white" />
                    </div>
                </div>
            }
        >
            <TwitterCallbackContent />
        </Suspense>
    );
}
