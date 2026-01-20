"use client";

import FarcasterIcon from "@/components/icons/FarcasterIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memo } from "react";
import { FieldError } from "react-hook-form";
import { GitHubConnect, GitHubConnectStatus } from "./GitHubConnect";
import { LinkedInConnect, LinkedInConnectStatus } from "./LinkedInConnect";
import { TwitterConnect, TwitterConnectStatus } from "./TwitterConnect";

interface SocialsInputProps {
    // Twitter OAuth
    twitterStatus: TwitterConnectStatus;
    twitterUsername?: string;
    onTwitterConnect: () => void;
    onTwitterDisconnect: () => void;
    twitterError?: string;
    // GitHub OAuth
    githubStatus: GitHubConnectStatus;
    githubUsername?: string;
    onGitHubConnect: () => void;
    onGitHubDisconnect: () => void;
    githubError?: string;
    // LinkedIn OAuth
    linkedinStatus: LinkedInConnectStatus;
    linkedinUsername?: string;
    linkedinDisplayName?: string;
    onLinkedInConnect: () => void;
    onLinkedInDisconnect: () => void;
    linkedinError?: string;
    // Farcaster (auto-filled from MiniApp context)
    farcasterUsername?: string;
    errors?: {
        farcaster?: FieldError;
    };
}

/**
 * 소셜 링크 입력 컴포넌트 - OAuth 기반 연동
 */
export const SocialsInput = memo(function SocialsInput({
    twitterStatus,
    twitterUsername,
    onTwitterConnect,
    onTwitterDisconnect,
    twitterError,
    githubStatus,
    githubUsername,
    onGitHubConnect,
    onGitHubDisconnect,
    githubError,
    linkedinStatus,
    linkedinUsername,
    linkedinDisplayName,
    onLinkedInConnect,
    onLinkedInDisconnect,
    linkedinError,
    farcasterUsername,
}: SocialsInputProps) {
    return (
        <div className="w-full">
            <label className="text-lg font-semibold text-basecard-black">
                Social Links
            </label>

            <div className="space-y-3">
                {/* Twitter OAuth Connect */}
                <TwitterConnect
                    status={twitterStatus}
                    username={twitterUsername}
                    onConnect={onTwitterConnect}
                    onDisconnect={onTwitterDisconnect}
                    error={twitterError}
                />

                {/* GitHub OAuth Connect */}
                <GitHubConnect
                    status={githubStatus}
                    username={githubUsername}
                    onConnect={onGitHubConnect}
                    onDisconnect={onGitHubDisconnect}
                    error={githubError}
                />

                {/* LinkedIn OAuth Connect */}
                <LinkedInConnect
                    status={linkedinStatus}
                    username={linkedinUsername}
                    displayName={linkedinDisplayName}
                    onConnect={onLinkedInConnect}
                    onDisconnect={onLinkedInDisconnect}
                    error={linkedinError}
                />

                {/* Farcaster - Auto-filled and disabled */}
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
                            value={
                                farcasterUsername ? `${farcasterUsername}` : ""
                            }
                            disabled
                            readOnly
                            placeholder="Auto-filled from Farcaster login"
                            className="pl-12 pr-4 h-12 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                        {farcasterUsername && (
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
                    {farcasterUsername && (
                        <p className="text-xs text-gray-400">
                            Connected via Farcaster MiniApp
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});
