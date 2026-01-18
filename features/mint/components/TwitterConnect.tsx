"use client";

import { Label } from "@/components/ui/label";
import { memo } from "react";
import { FaSquareXTwitter } from "react-icons/fa6";
import { LuLoader } from "react-icons/lu";

export type TwitterConnectStatus = "disconnected" | "connecting" | "connected";

interface TwitterConnectProps {
    status: TwitterConnectStatus;
    username?: string;
    onConnect: () => void;
    onDisconnect: () => void;
    error?: string;
}

export const TwitterConnect = memo(function TwitterConnect({
    status,
    username,
    onConnect,
    onDisconnect,
    error,
}: TwitterConnectProps) {
    const hasError = !!error;

    return (
        <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
                X (Twitter)
            </Label>

            <div className="relative">
                {/* 아이콘 (왼쪽) */}
                <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        hasError
                            ? "text-red-500"
                            : status === "connected"
                                ? "text-gray-700"
                                : "text-gray-400"
                    }`}
                >
                    {status === "connecting" ? (
                        <LuLoader className="w-5 h-5 text-basecard-blue animate-spin" />
                    ) : (
                        <FaSquareXTwitter className="w-5 h-5" />
                    )}
                </div>

                {/* 미연결: Connect 버튼 */}
                {status === "disconnected" && (
                    <button
                        type="button"
                        onClick={onConnect}
                        className={`w-full pl-12 pr-4 h-12 flex items-center justify-between text-base rounded-xl border-2 transition-all duration-300 ${
                            hasError
                                ? "border-red-500 hover:border-red-600"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <span className="text-gray-700 font-medium">Connect with X</span>
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
                        <span className="text-basecard-blue">Connecting...</span>
                    </div>
                )}

                {/* 연결됨: @username + 체크 + Disconnect */}
                {status === "connected" && username && (
                    <div className="w-full pl-12 pr-4 h-12 flex items-center justify-between text-base rounded-xl border-2 border-gray-200 bg-white">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-900">@{username}</span>
                        </div>
                        <button
                            type="button"
                            onClick={onDisconnect}
                            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Disconnect
                        </button>
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
