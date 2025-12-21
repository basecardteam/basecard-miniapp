"use client";

import FarcasterIcon from "@/components/icons/FarcasterIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memo } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FaGithub, FaLinkedin, FaSquareXTwitter } from "react-icons/fa6";

interface SocialsInputProps {
    baseName?: string | null;
    twitterRegister: UseFormRegisterReturn;
    githubRegister: UseFormRegisterReturn;
    farcasterRegister: UseFormRegisterReturn;
    linkedinRegister: UseFormRegisterReturn;
    errors: {
        twitter?: FieldError;
        github?: FieldError;
        farcaster?: FieldError;
        linkedin?: FieldError;
    };
}

const SOCIAL_CONFIG = [
    {
        id: "twitter",
        label: "Twitter / X",
        icon: <FaSquareXTwitter className="w-5 h-5" />,
        placeholder: "@username",
        registerKey: "twitter" as const,
    },
    {
        id: "github",
        label: "GitHub",
        icon: <FaGithub className="w-5 h-5" />,
        placeholder: "@username",
        registerKey: "github" as const,
    },
    {
        id: "farcaster",
        label: "Farcaster",
        icon: <FarcasterIcon size={20} className="text-gray-400" />,
        placeholder: "@username",
        registerKey: "farcaster" as const,
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        icon: <FaLinkedin className="w-5 h-5" />,
        placeholder: "username or url",
        registerKey: "linkedin" as const,
    },
];

/**
 * 소셜 링크 입력 컴포넌트 - 모던한 아이콘 디자인
 */
export const SocialsInput = memo(function SocialsInput({
    baseName,
    twitterRegister,
    githubRegister,
    farcasterRegister,
    linkedinRegister,
    errors,
}: SocialsInputProps) {
    const registers = {
        twitter: twitterRegister,
        github: githubRegister,
        farcaster: farcasterRegister,
        linkedin: linkedinRegister,
    };

    return (
        <div className="w-full">
            <label className="text-lg font-semibold text-basecard-black">
                Social Links
            </label>

            {/* Base Name Section */}
            <div className="space-y-1 mb-5">
                <Label
                    htmlFor="base_name_input"
                    className="text-sm font-medium text-gray-700"
                >
                        Base Name
                </Label>
                <Input
                    id="base_name_input"
                    type="text"
                    value={baseName || ""}
                    disabled
                    placeholder="Auto-filled from your wallet"
                    className="h-12 text-base rounded-xl border-2 border-gray-200 bg-basecard-white text-basecard-gray cursor-not-allowed"
                />
                <p className="text-sm text-basecard-gray italic">
                        Automatically synced from your Base wallet
                </p>
            </div>

            <div className="space-y-3">
                {SOCIAL_CONFIG.map((social) => {
                    const register = registers[social.registerKey];
                    const error = errors[social.registerKey];
                    const hasError = !!error;

                    return (
                        <div key={social.id} className="space-y-1">
                            <Label
                                htmlFor={social.id}
                                className="text-sm font-medium text-gray-700"
                            >
                                {social.label}
                            </Label>
                            <div className="relative">
                                <div
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                                        hasError
                                            ? "text-red-500"
                                            : "text-gray-400 group-focus-within:text-basecard-blue"
                                    }`}
                                >
                                    {social.icon}
                                </div>

                                {/* Input */}
                                <Input
                                    id={social.id}
                                    type="text"
                                    {...register}
                                    placeholder={social.placeholder}
                                    className={`pl-12 pr-4 h-12 text-base rounded-xl border-2 transition-all duration-300 ${
                                        hasError
                                            ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                            : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                                    }`}
                                />
                            </div>

                            {/* 에러 메시지 */}
                            {hasError && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <span>⚠</span> {error.message}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
