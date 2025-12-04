import BackButton from "@/components/common/BackButton";
import BaseButton from "@/components/ui/BaseButton";
import { Card } from "@/lib/types";
import MyCardBGImage from "@/public/assets/mybasecard-background.webp";
import FacasterLogo from "@/public/logo/farcaster-logo.png";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { FaGithub, FaGlobe, FaTwitter } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

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
    onClose,
}: CardContentProps) {
    const socialEntries: SocialEntry[] = useMemo(
        () => [
            {
                key: "farcaster",
                label: "Farcaster",
                icon: (
                    <Image
                        src={FacasterLogo}
                        alt="Farcaster"
                        width={24}
                        height={24}
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
        ],
        []
    );

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
        <div className="relative flex-1 flex flex-col">
            {mode === "profile" && (
                <div className="flex  items-center h-12 gap-x-2 mb-1">
                    <BackButton className="relative top-0 left-0" />
                    <div className="font-k2d-bold text-black text-3xl tracking-tighter leading-none">
                        {title}
                    </div>
                </div>
            )}

            <div className="m-5 flex-1 relative flex flex-col">
                <Image
                    src={MyCardBGImage}
                    alt="BaseCard Background"
                    fill
                    style={{
                        objectFit: "cover",
                        objectPosition: "60% 50%",
                        borderRadius: "12px",
                    }}
                    priority
                    unoptimized
                    className="-z-10"
                />
                {mode === "viewer" && (
                    <IoClose
                        size={40}
                        className="absolute top-2 right-2 text-white z-50 cursor-pointer p-1.5"
                        onClick={onClose}
                    />
                )}
                <div className="relative w-full h-full pt-5 flex flex-col flex-1">
                    <div className="flex flex-col items-center flex-1 w-full pb-5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-xl flex-none mb-5">
                            <Image
                                src={
                                    card.user?.profileImage
                                        ? card.user.profileImage
                                        : "/assets/default-profile.png"
                                }
                                alt={card.nickname || "User"}
                                width={64}
                                height={64}
                                className=" object-cover w-full h-full "
                                priority
                            />
                        </div>

                        <div className="mb-5 text-center">
                            <div className="font-k2d-bold text-white text-3xl flex-none">
                                {card.nickname}
                            </div>
                            <div className="font-k2d-regular text-white text-xl flex-none">
                                {card.role}
                            </div>
                        </div>

                        <div className="flex gap-4 px-5 mb-3">
                            {socialEntries.map(
                                ({ key, icon, label }: SocialEntry) => {
                                    const rawValue = socials?.[key] ?? "";
                                    const value = rawValue.trim();
                                    const hasUrl = value.length > 0;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                if (hasUrl)
                                                    handleOpenUrl(key, value);
                                            }}
                                            disabled={
                                                !hasUrl || isSocialLoading
                                            }
                                            className={clsx(
                                                "w-10 h-10 rounded-full bg-black flex items-center justify-center transition-opacity",
                                                (!hasUrl || isSocialLoading) &&
                                                    "opacity-40 cursor-not-allowed"
                                            )}
                                            aria-label={label}
                                        >
                                            {icon}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <div className="w-full flex-1 px-5">
                            {/* Bio Section */}
                            <p className="min-h-32 font-k2d-regular border border-[#3E7CFF] leading-5 text-white text-base text-center flex justify-center items-center p-3 rounded-2xl shadow-xl  bg-white/[4%] overflow-auto">
                                {card.bio}
                            </p>

                            {/* Skills Section - Removed as it is not in the new Card type */}
                            {/* <div className="w-full flex flex-wrap gap-2 justify-center px-5 mt-5">
                                {(card.skills ?? []).map((skill: string, index: number) => (
                                    <div
                                        key={index}
                                        className="font-k2d-medium text-sm text-white text-center px-4 py-1.5 rounded-xl bg-[#0050FF] border border-[#3E7CFF]"
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div> */}
                        </div>
                    </div>

                    {/* Viewer 모드에서는 Basename만 표시 - Basename removed from type */}
                    {mode === "viewer" && (
                        <div className="w-full mt-auto">
                            {/* <button
                                onClick={() => openUrl(`https://base.org/name/${card.basename}`)}
                                className="w-full py-3 bg-[#0050FF] text-white font-k2d-regular text-lg rounded-br-xl rounded-bl-xl"
                            >
                                {card.basename.length > 0 ? card.basename : "No Basename"}
                            </button> */}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons - viewer 모드에서는 숨김 */}
            {mode === "profile" && (
                <div className="w-full flex flex-col gap-3 px-5 py-3">
                    {/* Basename Button (Primary Action) - Basename removed from type */}
                    {/* <button
                        onClick={() => openUrl(`https://base.org/name/${card.basename}`)}
                        className="w-full py-3 bg-[#0050FF] text-white font-k2d-regular text-lg rounded-xl transition-colors shadow-lg"
                    >
                        {card.basename.length > 0 ? card.basename : "No Basename"}
                    </button> */}

                    {onNavigateToCollection && (
                        <BaseButton
                            onClick={onNavigateToCollection}
                            className="flex-none"
                        >
                            My Collection
                        </BaseButton>
                    )}
                </div>
            )}
        </div>
    );
}
