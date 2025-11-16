"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FacasterGrayLogo from "@/public/logo/FacasterGrayLogo.png";
import Image from "next/image";
import { memo } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FaGithub, FaSquareXTwitter } from "react-icons/fa6";

interface SocialsInputProps {
    twitterRegister: UseFormRegisterReturn;
    githubRegister: UseFormRegisterReturn;
    farcasterRegister: UseFormRegisterReturn;
    errors: {
        twitter?: FieldError;
        github?: FieldError;
        farcaster?: FieldError;
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
        icon: <Image src={FacasterGrayLogo} alt="Farcaster" width={20} height={20} className="object-contain text-gray-200" />,
        placeholder: "@username",
        registerKey: "farcaster" as const,
    },
];

/**
 * 소셜 링크 입력 컴포넌트 - 모던한 아이콘 디자인
 */
export const SocialsInput = memo(function SocialsInput({
    twitterRegister,
    githubRegister,
    farcasterRegister,
    errors,
}: SocialsInputProps) {
    const registers = {
        twitter: twitterRegister,
        github: githubRegister,
        farcaster: farcasterRegister,
    };

    return (
        <div className="w-full space-y-4">
            <label className="text-lg font-semibold text-gray-900">Social Links</label>

            <div className="space-y-4">
                {SOCIAL_CONFIG.map((social) => {
                    const register = registers[social.registerKey];
                    const error = errors[social.registerKey];
                    const hasError = !!error;

                    return (
                        <div key={social.id} className="space-y-2">
                            <Label htmlFor={social.id} className="text-sm font-medium text-gray-700">
                                {social.label}
                            </Label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${hasError ? "text-red-500" : "text-gray-400 group-focus-within:text-[#0050FF]"}`} >
                                    {social.icon}
                                </div>

                                {/* Input */}
                                <Input
                                    id={social.id}
                                    type="text"
                                    {...register}
                                    placeholder={social.placeholder}
                                    className={`pl-12 pr-4 h-12 text-base rounded-xl border-2 transition-all duration-300 ${hasError
                                        ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                        : "border-gray-200 focus:border-[#0050FF] focus:ring-[#0050FF]/20 hover:border-gray-300"
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
