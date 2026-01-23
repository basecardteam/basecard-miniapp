"use client";

import FarcasterIcon from "@/components/icons/FarcasterIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memo } from "react";

export interface FarcasterConnectProps {
    username?: string;
}

export const FarcasterConnect = memo(function FarcasterConnect({
    username,
}: FarcasterConnectProps) {
    return (
        <div className="space-y-1">
            <Label
                htmlFor="farcaster"
                className="text-sm font-medium text-gray-700"
            >
                Farcaster
            </Label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
                    <FarcasterIcon size={20} />
                </div>
                <Input
                    id="farcaster"
                    type="text"
                    value={username ? `@${username}` : ""}
                    disabled
                    readOnly
                    placeholder="Auto-filled from Farcaster login"
                    className="pl-12 pr-12 h-12 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                {username && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                )}
            </div>
            {username && (
                <p className="text-xs text-gray-400">
                    Connected via Farcaster MiniApp
                </p>
            )}
        </div>
    );
});
