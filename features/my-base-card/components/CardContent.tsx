import BackButton from "@/components/buttons/BackButton";
import FarcasterIcon from "@/components/icons/FarcasterIcon";
import { BaseModal } from "@/components/modals/BaseModal";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/lib/types";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FaGithub, FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";

interface CardContentProps {
    card: Card;
    openUrl: (url: string) => void;
    socials?: Record<string, string>;
    isSocialLoading?: boolean;
    mode?: "viewer" | "profile";
    title?: string;
    onNavigateToCollection?: () => void;
    onClose?: () => void;
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

export default function CardContent({
    card,
    openUrl,
    socials = {},
    isSocialLoading = false,
    mode = "profile",
    title = "My BaseCard",
    onNavigateToCollection,
}: CardContentProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const socialEntries: SocialEntry[] = useMemo(
        () => [
            {
                key: "farcaster",
                label: "Farcaster",
                icon: <FarcasterIcon size={20} className="text-white" />,
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
        // If socials prop has values, use it; otherwise fallback to card.socials
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

    const { data: user } = useUser();

    // Figma Design based Layout - Adapted to be responsive but keeping relative positioning logic
    return (
        <div className="w-full flex flex-col items-center">
            {/* Header Title for Profile Mode */}
            {mode === "profile" && (
                <div className="flex w-full items-center h-12 gap-x-2 mb-4 px-4">
                    <BackButton className="relative top-0 left-0" />
                    <div className="font-k2d font-bold text-black text-3xl tracking-tighter leading-none">
                        {title}
                    </div>
                </div>
            )}

            {/* Card Container - Responsive with max dimensions */}
            <div
                className={clsx(
                    "relative w-full flex-1 max-w-[360px] max-h-[520px] rounded-[12px] mx-auto my-auto shadow-2xl",
                    mode === "viewer" ? "bg-transparent" : "bg-basecard-blue"
                )}
            >
                {/* Background Image - Only for viewer mode or if we want texture in profile too. 
                    The design shows a clean blue card. Let's keep the image for viewer, 
                    and maybe just solid color for profile to match 'clean' look or reuse image if needed. 
                    The user said "bg is basecard-white" for the page, "draw it like this" for the card.
                    The card in image has a gradient/pattern. Let's use the image for consistency or just the color.
                    For now, I'll assume solid basecard-blue for profile mode as per previous requests for 'blue'.
                */}

                {/* Content Wrapper */}
                <div className="relative w-full h-full flex flex-col items-center">
                    {/* Profile Image - positioned relatively or absolutely based on design ratio */}
                    <div className="mt-[40px] w-[64px] h-[64px] rounded-xl overflow-hidden shadow-lg border-2 border-white/20 flex-none bg-black/20">
                        <Image
                            src={
                                user?.profileImage
                                    ? user.profileImage
                                    : "/assets/default-profile.png"
                            }
                            alt={card.nickname || "User"}
                            width={64}
                            height={64}
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Nickname: Top 109px */}
                    <div className="absolute top-[109px] w-full flex justify-center items-center gap-2">
                        <h2 className="font-k2d font-bold text-[30px] leading-[44px] text-white tracking-tight drop-shadow-md truncate max-w-[200px]">
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
                    <div className="mt-[-5px] w-full text-center px-4">
                        <p className="font-pretendard font-light text-[23px] leading-[44px] text-white tracking-tight truncate">
                            {card.role || "Builder"}
                        </p>
                    </div>

                    {/* Social Icons */}
                    <div className="mt-[5px] flex items-center gap-[14px]">
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
                        className="mt-[20px] w-[calc(100%-24px)] max-w-[330px] min-h-[70px] rounded-[8px] border border-[#3E7CFF]/50 flex items-center justify-center px-4 py-3"
                        style={{ background: "rgba(255, 255, 255, 0.15)" }}
                    >
                        <p className="font-k2d font-medium text-[14px] leading-[20px] text-center text-white break-words">
                            {card.bio || "Hi, I'm a based builder"}
                        </p>
                    </div>

                    {/* Edit Profile Button: Bottom */}
                    {mode === "profile" && onNavigateToCollection && (
                        <button
                            onClick={onNavigateToCollection}
                            className="absolute bottom-0 left-0 w-full h-[50px] bg-white rounded-b-[12px] flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                        >
                            <span className="font-pretendard font-normal text-[16px] text-basecard-blue">
                                Edit Profile
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Share Modal (TODO) */}
            <BaseModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Share Feature"
                description="Share functionality is coming soon!"
                buttonText="Close"
            />
        </div>
    );
}
