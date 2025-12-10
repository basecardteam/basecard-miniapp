import Link from "next/link";
import Image from "next/image";
import { useMemo, useCallback, useState } from "react";
import clsx from "clsx";
import { FaGithub, FaGlobe, FaTwitter, FaLinkedin } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";

import { Card } from "@/lib/types";
import { BaseModal } from "@/components/modals/BaseModal";
import MyCardBGImage from "@/public/assets/mybasecard-background.webp";
import FacasterLogo from "@/public/logo/farcaster-logo.png";
import { useUser } from "@/hooks/useUser";
import BackButton from "@/components/buttons/BackButton";
import { resolveIpfsUrl } from "@/lib/ipfs";

interface ProfileCardContentProps {
    card: Card;
    openUrl: (url: string) => void;
    socials?: Record<string, string>;
    isSocialLoading?: boolean;
    onNavigateToCollection: () => void;
    title?: string;
}

type SocialEntry = {
    key: string;
    label: string;
    icon: React.ReactNode;
};

const socialPrefixes: Record<string, string> = {
    x: "https://x.com/",
    twitter: "https://x.com/",
    farcaster: "https://farcaster.xyz/",
    github: "https://github.com/",
    website: "",
};

const valueToUrl = (key: string, raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return "";

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (hasProtocol) return trimmed;

    const prefix = socialPrefixes[key] ?? "";
    if (prefix.length === 0) return trimmed;

    const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
    return `${prefix}${normalized}`;
};

export default function ProfileCardContent({
    card,
    openUrl,
    socials = {},
    isSocialLoading = false,
    onNavigateToCollection,
    title = "My BaseCard",
}: ProfileCardContentProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const { data: user } = useUser();

    const socialEntries: SocialEntry[] = useMemo(
        () => [
            {
                key: "farcaster",
                label: "Farcaster",
                icon: (
                    <Image
                        src={FacasterLogo}
                        alt="Farcaster"
                        width={20}
                        height={20}
                        className="object-contain"
                    />
                ),
            },
            {
                key: "github",
                label: "GitHub",
                icon: <FaGithub className="text-white" size={20} />,
            },
            {
                key: "website",
                label: "Website",
                icon: <FaGlobe className="text-white" size={20} />,
            },
            {
                key: "x",
                label: "Twitter",
                icon: <FaTwitter className="text-white" size={20} />,
            },
            {
                key: "linkedin",
                label: "LinkedIn",
                icon: <FaLinkedin className="text-white" size={20} />,
            },
        ],
        []
    );

    // Use card.socials as fallback if socials prop is empty
    const effectiveSocials = useMemo(() => {
        if (socials && Object.keys(socials).length > 0) {
            return socials;
        }
        return card.socials || {};
    }, [socials, card.socials]);

    const handleOpenUrl = useCallback(
        (key: string, rawValue: string) => {
            const url = valueToUrl(key, rawValue);
            if (url.length === 0) {
                return;
            }
            openUrl(url);
        },
        [openUrl]
    );

    return (
        <div className="w-full flex flex-col items-center">
            {/* Header Title */}
            <div className="flex w-full items-center h-12 gap-x-2 mb-4 px-4">
                <BackButton className="relative top-0 left-0" />
                <div className="font-k2d font-bold text-black text-3xl tracking-tighter leading-none">
                    {title}
                </div>
            </div>

            <div className="relative w-full flex-1 max-w-[360px] max-h-[520px] rounded-[12px] mx-auto my-auto overflow-hidden shadow-2xl bg-basecard-blue">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={MyCardBGImage}
                        alt="BaseCard Background"
                        fill
                        style={{
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                        priority
                        unoptimized
                    />
                </div>

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                    {/* Profile Image */}
                    <div className="mt-[40px] w-[64px] h-[64px] rounded-xl overflow-hidden shadow-lg border-2 border-white/20 flex-none bg-black/20">
                        <Image
                            src={
                                user?.profileImage
                                    ? resolveIpfsUrl(user.profileImage)
                                    : "/assets/default-profile.png"
                            }
                            alt={card.nickname || "User"}
                            width={64}
                            height={64}
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Nickname */}
                    <div className="mt-[20px] w-full flex justify-center items-center gap-2">
                        <h2 className="font-k2d font-bold text-[30px] leading-normal text-white tracking-tight drop-shadow-md truncate max-w-[200px] py-1">
                            {card.nickname || "Unknown"}
                        </h2>
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="text-white hover:opacity-80 transition-opacity p-1"
                        >
                            <IoShareOutline size={24} />
                        </button>
                    </div>
                    {/* Role */}
                    <div className="mt-[4px] w-full text-center px-4">
                        <p className="font-pretendard font-light text-[18px] text-white/90 tracking-tight truncate">
                            {card.role || "Builder"}
                        </p>
                    </div>
                    {/* Social Icons */}
                    <div className="mt-[20px] flex items-center gap-[14px]">
                        {socialEntries.map(({ key, icon, label }) => {
                            const rawValue = effectiveSocials?.[key] ?? "";
                            const value = rawValue.trim();
                            const hasUrl = value.length > 0;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (hasUrl) handleOpenUrl(key, value);
                                    }}
                                    disabled={!hasUrl || isSocialLoading}
                                    className={clsx(
                                        "w-[37px] h-[37px] rounded-full flex items-center justify-center border transition-all",
                                        hasUrl
                                            ? "bg-[#0455FF] border-[#3E7CFF] hover:opacity-90 cursor-pointer"
                                            : "bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed"
                                    )}
                                    aria-label={label}
                                >
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                    {/* Bio (Description) */}
                    <div
                        className="mt-[24px] mb-4 w-[calc(100%-48px)] max-w-[330px] min-h-[70px] rounded-[8px] border border-[#3E7CFF]/50 flex items-center justify-center px-4 py-3"
                        style={{ background: "rgba(255, 255, 255, 0.15)" }}
                    >
                        <p className="font-k2d font-medium text-[14px] leading-[20px] text-center text-white break-words">
                            {card.bio || "Hi, I'm a base builder"}
                        </p>
                    </div>
                    {/* Spacer to push button to bottom or just fill space */}
                    <div className="flex-1" />
                    {/* Edit Profile Button */}
                    <button
                        onClick={onNavigateToCollection}
                        className="w-full h-[60px] bg-[#0455FF] flex items-center justify-center gap-2 hover:bg-[#0344CC] transition-colors mt-auto"
                    >
                        <span className="font-pretendard font-normal text-[16px] text-white">
                            Edit Profile
                        </span>
                    </button>
                </div>

                {/* Share Modal */}
                <BaseModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    title="Share Feature"
                    description="Share functionality is coming soon!"
                    buttonText="Close"
                />
            </div>
        </div>
    );
}
