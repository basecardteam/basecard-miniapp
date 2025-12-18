import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FaGithub, FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi";
import { IoShareOutline } from "react-icons/io5";

import FarcasterIcon from "@/components/icons/FarcasterIcon";
import ShareBottomSheet from "@/components/modals/ShareBottomSheet";
import { ShareModal } from "@/components/modals/ShareModal";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/hooks/useUser";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { generateCardShareQRCode, generateCardShareURL } from "@/lib/qrCodeGenerator";
import { Card } from "@/lib/types";
import BCLogo from "@/public/bc-icon.png";
import { sdk } from "@farcaster/miniapp-sdk";
import { useRouter } from "next/navigation";

interface ProfileCardContentProps {
    card: Card;
    socials?: Record<string, string>;
    isSocialLoading?: boolean;
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
    socials = {},
    isSocialLoading = false,
}: ProfileCardContentProps) {
    const openUrl = sdk.actions.openUrl;
    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
    const [isLoadingQR, setIsLoadingQR] = useState(false);
    const { data: user } = useUser();
    const { showToast } = useToast();
    const router = useRouter();

    const handleNavigateToCollection = useCallback(() => {
        router.push("/edit-profile");
    }, [router]);

    // Copy Link handler
    const handleCopyLink = useCallback(async () => {
        try {
            const shareURL = generateCardShareURL(card.id.toString());
            await navigator.clipboard.writeText(shareURL);
            showToast("Link copied!", "success");
        } catch (error) {
            console.error("Failed to copy link:", error);
            showToast("Failed to copy link", "error");
        }
    }, [card.id, showToast]);

    // Share with QR handler
    const handleShareQR = useCallback(async () => {
        setIsQRModalOpen(true);
        setIsLoadingQR(true);
        try {
            const qrCode = await generateCardShareQRCode(card.id.toString(), {
                width: 250,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF00",
                },
            });
            setQrCodeDataURL(qrCode);
        } catch (error) {
            console.error("Failed to generate QR code:", error);
            setQrCodeDataURL("");
        } finally {
            setIsLoadingQR(false);
        }
    }, [card.id]);

    // Cast my Card handler (share to Farcaster)
    const handleCastCard = useCallback(async () => {
        const shareUrl = generateCardShareURL(card.id.toString());
        const imageUrl = card?.imageUri
            ? resolveIpfsUrl(card.imageUri)
            : undefined;
        await shareToFarcaster({
            text: `Check out my Basecard! Collect this and see all about me 🎉`,
            imageUrl,
            embedUrl: shareUrl,
        });
    }, [card]);

    const socialEntries: SocialEntry[] = useMemo(
        () => [
            {
                key: "farcaster",
                label: "Farcaster",
                icon: <FarcasterIcon size={22} className="text-white" />,
            },
            {
                key: "github",
                label: "GitHub",
                icon: <FaGithub className="text-white" size={24} />,
            },
            {
                key: "website",
                label: "Website",
                icon: <FaGlobe className="text-white" size={24} />,
            },
            {
                key: "x",
                label: "Twitter",
                icon: <FaTwitter className="text-white" size={24} />,
            },
            {
                key: "linkedin",
                label: "LinkedIn",
                icon: <FaLinkedin className="text-white" size={24} />,
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
        <div className="w-full flex flex-col items-center px-5">
            <div
                className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-basecard-blue"
                style={{
                    backgroundImage: "url(assets/mybasecard-background.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Edit Button - Top Right */}
                <button
                    onClick={handleNavigateToCollection}
                    className="absolute top-1 right-1 z-20 rounded-full  flex justify-center items-center
                        hover:bg-black/10 transition-colors active:scale-95"
                    aria-label="Edit Profile"
                >
                    <HiOutlinePencil className="text-white" size={18} />
                </button>

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full flex flex-col items-center p-5">
                    {/* Profile Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/20 flex-none bg-black/20">
                        <Image
                            src={
                                user?.profileImage
                                    ? resolveIpfsUrl(user.profileImage)
                                    : "/assets/default-profile.png"
                            }
                            alt={card.nickname || "User"}
                            width={80}
                            height={80}
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Nickname */}
                    <div className="w-full h-fit flex justify-center items-center mt-4">
                        <p className="font-semibold text-3xl leading-none text-white truncate">
                            {card.nickname || "Unknown"}
                        </p>
                    </div>
                    {/* Role */}
                    <div className="mt-1 w-full text-center">
                        <p className="font-light text-lg text-white/90 tracking-tight truncate">
                            {card.role || "Builder"}
                        </p>
                    </div>
                    {/* Social Icons */}
                    <div className="mt-4 flex items-center gap-3">
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
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
                                        ${
                                hasUrl
                                    ? "bg-[#0455FF] border-[#3E7CFF] hover:opacity-90 cursor-pointer"
                                    : "bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed"
                                }`}
                                    aria-label={label}
                                >
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                    {/* Bio (Description) */}
                    <div className="mt-4 w-full min-h-16 px-4 py-3 rounded-lg border border-[#3E7CFF]/50 bg-black/5 flex items-center justify-center">
                        <p className="font-medium text-sm leading-5 text-center text-white break-words w-full">
                            {card.bio || "Hi, I'm a base builder"}
                        </p>
                    </div>
                    {/* Share Button */}
                    <button
                        onClick={() => setIsShareSheetOpen(true)}
                        className="mt-4 w-full h-12 bg-[#0455FF] rounded-lg flex items-center justify-center gap-1
                            hover:bg-[#0344CC] transition-colors"
                    >
                        <IoShareOutline className="text-white" size={20} />
                        <span className="font-medium text-base text-white">
                            Share
                        </span>
                    </button>
                </div>

                {/* Share Bottom Sheet */}
                <ShareBottomSheet
                    isOpen={isShareSheetOpen}
                    onClose={() => setIsShareSheetOpen(false)}
                    onCopyLink={handleCopyLink}
                    onShareQR={handleShareQR}
                    onCastCard={handleCastCard}
                />

                {/* QR Code Modal */}
                <ShareModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    title="Share My Card"
                    profileImageUrl={user?.profileImage ? resolveIpfsUrl(user.profileImage) : undefined}
                    name={card?.nickname || undefined}
                    subtitle={card?.role || undefined}
                    qrCodeDataURL={qrCodeDataURL}
                    isLoadingQR={isLoadingQR}
                    qrErrorMessage="QR 코드 생성 실패"
                    logoSrc={BCLogo.src}
                />
            </div>
        </div>
    );
}
