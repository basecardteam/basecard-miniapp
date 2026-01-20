"use client";

import {
    clearOAuthState,
    exchangeCodeForToken,
    getLinkedInUser,
    getOAuthConfig,
    getOAuthState,
    saveTokens,
} from "@/lib/api/linkedin";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";

interface CallbackState {
    status: "loading" | "success" | "error";
    displayName: string;
    errorMessage: string;
}

function LinkedInCallbackContent() {
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
        displayName: "",
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
                    displayName: "",
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
                    displayName: "",
                    errorMessage: "Session expired. Please try again.",
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

                const user = await getLinkedInUser(tokens.access_token);

                clearOAuthState();

                localStorage.setItem(
                    "linkedin_oauth_result",
                    JSON.stringify({ success: true, user }),
                );

                setCallbackState({
                    status: "success",
                    displayName: user.name,
                    errorMessage: "",
                });

                // MiniApp 딥링크로 리다이렉트 (결과를 URL에 포함)
                const miniAppDomain = "miniapp.basecardteam.org";
                const redirectPath = `/edit-profile?linkedin_connected=${encodeURIComponent(user.sub)}&linkedin_name=${encodeURIComponent(user.name)}`;
                const miniAppDeepLink = `https://farcaster.xyz/~/mini-apps/launch?domain=${miniAppDomain}&path=${encodeURIComponent(redirectPath)}`;

                setTimeout(() => {
                    window.location.href = miniAppDeepLink;
                }, 1200);
            } catch (err) {
                clearOAuthState();
                setCallbackState({
                    status: "error",
                    displayName: "",
                    errorMessage:
                        err instanceof Error
                            ? err.message
                            : "Authentication failed",
                });

                localStorage.setItem(
                    "linkedin_oauth_result",
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

    const { status, displayName, errorMessage } = callbackState;

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
                                    : "bg-[#0A66C2]"
                            } ${status === "loading" ? "animate-pulse" : ""}`}
                        >
                            <FaLinkedin
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
                                    Connecting to LinkedIn
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
                                <p className="text-base text-[#0A66C2] font-medium">
                                    {displayName}
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
                            className="mt-2 px-6 py-2.5 bg-[#0A66C2] text-white text-sm font-medium
                                rounded-xl hover:bg-[#004182] active:scale-95 transition-all"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LinkedInCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                    <div className="w-16 h-16 rounded-2xl bg-[#0A66C2] flex items-center justify-center shadow-lg animate-pulse">
                        <FaLinkedin className="w-8 h-8 text-white" />
                    </div>
                </div>
            }
        >
            <LinkedInCallbackContent />
        </Suspense>
    );
}
