"use client";

import { memo } from "react";
import { GitHubConnect } from "./GitHubConnect";
import { LinkedInConnect } from "./LinkedInConnect";
import { XConnect } from "./XConnect";
import { FarcasterConnect } from "./FarcasterConnect";

interface SocialsInputProps {
    // X (Twitter)
    xInitialUsername?: string;
    xInitialVerified?: boolean;
    onXUpdate?: (username: string) => void;

    // GitHub
    githubInitialUsername?: string;
    githubInitialVerified?: boolean;
    onGitHubUpdate?: (username: string) => void;

    // LinkedIn
    linkedinInitialUsername?: string;
    linkedinInitialVerified?: boolean;
    linkedinValidationError?: string;
    onLinkedInUpdate?: (url: string) => void;

    // Farcaster (auto-filled from MiniApp context)
    farcasterUsername?: string;
}

/**
 * 소셜 링크 입력 컴포넌트 - OAuth 기반 연동
 */
export const SocialsInput = memo(function SocialsInput({
    xInitialUsername,
    xInitialVerified,
    onXUpdate,
    githubInitialUsername,
    githubInitialVerified,
    onGitHubUpdate,
    linkedinInitialUsername,
    linkedinInitialVerified,
    linkedinValidationError,
    onLinkedInUpdate,
    farcasterUsername,
}: SocialsInputProps) {
    return (
        <div className="w-full">
            <label className="text-lg font-semibold text-basecard-black">
                Social Links
            </label>

            <div className="space-y-3">
                {/* X OAuth Connect */}
                <XConnect
                    initialUsername={xInitialUsername}
                    initialVerified={xInitialVerified}
                    onUpdate={onXUpdate}
                />

                {/* GitHub OAuth Connect */}
                <GitHubConnect
                    initialUsername={githubInitialUsername}
                    initialVerified={githubInitialVerified}
                    onUpdate={onGitHubUpdate}
                />

                {/* LinkedIn OAuth Connect */}
                <LinkedInConnect
                    initialUsername={linkedinInitialUsername}
                    initialVerified={linkedinInitialVerified}
                    validationError={linkedinValidationError}
                    onUpdate={onLinkedInUpdate}
                />

                {/* Farcaster - Auto-filled and disabled */}
                <FarcasterConnect username={farcasterUsername} />
            </div>
        </div>
    );
});
