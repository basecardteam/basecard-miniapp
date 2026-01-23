"use client";

import { useLinkedInAuth } from "@/hooks/useLinkedInAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { memo, useState, useEffect } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { LuLoader } from "react-icons/lu";
import { sdk } from "@farcaster/miniapp-sdk";

export type LinkedInConnectStatus = "disconnected" | "connecting" | "connected";

export interface LinkedInConnectProps {
    initialUsername?: string;
    initialVerified?: boolean;
    validationError?: string;
    onUpdate?: (url: string) => void;
}

export const LinkedInConnect = memo(function LinkedInConnect({
    initialUsername,
    initialVerified,
    validationError,
    onUpdate,
}: LinkedInConnectProps) {
    const { status, username, displayName, error, connect, disconnect } =
        useLinkedInAuth({
            initialUsername,
            initialVerified,
            onUsernameChange: onUpdate,
        });
    const hasError = !!error;

    // State for profile URL input (shown when verified)
    const [profileUrl, setProfileUrl] = useState(initialUsername || "");

    // Sync profileUrl when initialUsername changes
    useEffect(() => {
        if (initialUsername) {
            setProfileUrl(initialUsername);
        }
    }, [initialUsername]);

    // Handle URL input change - pass full URL for validation
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setProfileUrl(value);
        // Pass full URL to form for validation, not just handle
        if (onUpdate) {
            onUpdate(value);
        }
    };

    // Extract LinkedIn handle from URL
    const extractLinkedInHandle = (input: string): string => {
        if (!input) return "";
        // If it's a full URL, extract the handle
        const match = input.match(/linkedin\.com\/in\/([^/?]+)/);
        if (match) {
            return match[1];
        }
        // Otherwise return as-is (user might enter just the handle)
        return input.replace(/^@/, "");
    };

    const handleConnect = async () => {
        try {
            const isMiniApp = await sdk.isInMiniApp();

            if (isMiniApp) {
                const url = await connect();
                if (url) {
                    sdk.actions.openUrl(url);
                }
            } else {
                const popup = window.open("about:blank", "_blank");
                if (!popup) {
                    alert("Please allow popups to connect with LinkedIn");
                    return;
                }

                const url = await connect();
                if (url) {
                    popup.location.href = url;
                } else {
                    popup.close();
                }
            }
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    };

    return (
        <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
                LinkedIn
            </Label>

            <div className="relative">
                {/* 아이콘 (왼쪽) - connected 상태에서는 숨김 (내부에 아이콘 있음) */}
                {status !== "connected" && (
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
                            hasError ? "text-red-500" : "text-gray-400"
                        }`}
                    >
                        {status === "connecting" ? (
                            <LuLoader className="w-5 h-5 text-basecard-blue animate-spin" />
                        ) : (
                            <FaLinkedin className="w-5 h-5" />
                        )}
                    </div>
                )}

                {/* 미연결: Connect 버튼 */}
                {status === "disconnected" && (
                    <button
                        type="button"
                        onClick={handleConnect}
                        className={`w-full pl-12 pr-4 h-12 flex items-center justify-between text-base rounded-xl border-2 transition-all duration-300 ${
                            hasError
                                ? "border-red-500 hover:border-red-600"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <span className="text-gray-700 font-medium">
                            Connect with LinkedIn
                        </span>
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}

                {/* 연결 중 */}
                {status === "connecting" && (
                    <div className="w-full pl-12 pr-4 h-12 flex items-center text-base rounded-xl border-2 border-basecard-blue/30 bg-basecard-blue/5">
                        <span className="text-basecard-blue">
                            Connecting...
                        </span>
                    </div>
                )}

                {/* 연결됨: 이름 표시 + URL 입력 필드 */}
                {status === "connected" && username && (
                    <div className="space-y-2">
                        {/* Verified name display with disconnect button */}
                        <div className="w-full pl-4 pr-4 h-12 flex items-center justify-between text-base rounded-xl border-2 border-green-200 bg-green-50">
                            <div className="flex items-center gap-2">
                                <FaLinkedin className="w-5 h-5 text-[#0A66C2]" />
                                <span className="text-gray-900">
                                    {displayName || username}
                                </span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    Verified
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={disconnect}
                                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>

                        {/* Profile URL input */}
                        <div className="relative">
                            <Input
                                type="text"
                                value={profileUrl}
                                onChange={handleUrlChange}
                                placeholder="linkedin.com/in/your-profile"
                                className={`pl-4 pr-4 h-10 text-sm rounded-lg border-2 transition-all ${
                                    validationError
                                        ? "border-red-500 focus:border-red-600"
                                        : "border-gray-200 focus:border-[#0A66C2]"
                                }`}
                            />
                            {validationError ? (
                                <p className="text-xs text-red-500 mt-1">
                                    ⚠ {validationError}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter your LinkedIn profile URL
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 에러 메시지 */}
            {hasError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
});
