import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FaGithub, FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi";
import { IoCheckmarkCircle, IoClose, IoShareOutline } from "react-icons/io5";
import { MdOutlineBookmarkAdd } from "react-icons/md";

import FarcasterIcon from "@/components/icons/FarcasterIcon";
import ShareBottomSheet from "@/components/modals/ShareBottomSheet";
import { ShareModal } from "@/components/modals/ShareModal";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import { useConfig } from "@/hooks/api/useConfig";
import { useUser } from "@/hooks/api/useUser";
import { logger } from "@/lib/common/logger";
import { shareToFarcaster } from "@/lib/farcaster/share";
import {
    generateCardShareQRCode,
    generateCardShareURL,
} from "@/lib/qrCodeGenerator";
import { Card } from "@/lib/types";
import { resolveIpfsUrl } from "@/lib/utils";
import defaultProfileImage from "@/public/assets/default-profile.png";
import BCLogo from "@/public/bc-icon.png";
import { sdk } from "@farcaster/miniapp-sdk";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

// =============================================================================
// Types
// =============================================================================

interface ProfileCardContentProps {
    card: Card;
    mode?: "profile" | "viewer";
    onClose?: () => void;
    isCollected?: boolean;
    onCollect?: () => void;
}

type SocialEntry = {
    key: string;
    label: string;
    icon: React.ReactNode;
};

// =============================================================================
// Constants
// =============================================================================

const SOCIAL_PREFIXES: Record<string, string> = {
    x: "https://x.com/",
    farcaster: "https://farcaster.xyz/",
    github: "https://github.com/",
    website: "",
};

const SOCIAL_ENTRIES: SocialEntry[] = [
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
        label: "X",
        icon: <FaTwitter className="text-white" size={24} />,
    },
    {
        key: "linkedin",
        label: "LinkedIn",
        icon: <FaLinkedin className="text-white" size={24} />,
    },
];

// =============================================================================
// Utility Functions
// =============================================================================

const valueToUrl = (key: string, raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return "";

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (hasProtocol) return trimmed;

    const prefix = SOCIAL_PREFIXES[key] ?? "";
    if (prefix.length === 0) return trimmed;

    const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
    return `${prefix}${normalized}`;
};

// =============================================================================
// Main Component
// =============================================================================

export default function ProfileCardContent({
    card,
    mode = "profile",
    onClose,
    isCollected = false,
    onCollect,
}: ProfileCardContentProps) {
    const router = useRouter();
    const openUrl = sdk.actions.openUrl;
    const frameContext = useFrameContext();
    const { data: user } = useUser();
    const { address } = useAccount();
    const { showToast } = useToast();
    const { ipfsGatewayUrl } = useConfig();

    // =========================================================================
    // Derived States
    // =========================================================================

    const isProfile = mode === "profile";
    const isViewer = mode === "viewer";

    // Use card.socials directly
    const socials = card.socials || {};
    logger.info("socials", socials);
    const profileImageUrl = useMemo(() => {
        const pfpUrl = (frameContext?.context as MiniAppContext)?.user?.pfpUrl;
        return pfpUrl || defaultProfileImage.src;
    }, [frameContext?.context]);

    // =========================================================================
    // Modal States
    // =========================================================================

    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
    const [isLoadingQR, setIsLoadingQR] = useState(false);

    // =========================================================================
    // Handlers
    // =========================================================================

    const handleNavigateToEdit = useCallback(() => {
        router.push("/edit-profile");
    }, [router]);

    const handleOpenUrl = useCallback(
        (key: string, rawValue: string) => {
            const url = valueToUrl(key, rawValue);
            if (url.length === 0) return;
            openUrl(url);
        },
        [openUrl]
    );

    const handleCopyLink = useCallback(async () => {
        if (!address) return;
        try {
            const shareURL = generateCardShareURL(address);
            await navigator.clipboard.writeText(shareURL);
            showToast("Link copied!", "success");
        } catch (error) {
            console.error("Failed to copy link:", error);
            showToast("Failed to copy link", "error");
        }
    }, [address, showToast]);

    const handleShareQR = useCallback(async () => {
        if (!address) return;
        setIsQRModalOpen(true);
        setIsLoadingQR(true);
        try {
            const qrCode = await generateCardShareQRCode(address, {
                width: 250,
                margin: 2,
                color: { dark: "#000000", light: "#FFFFFF00" },
            });
            setQrCodeDataURL(qrCode);
        } catch (error) {
            console.error("Failed to generate QR code:", error);
            setQrCodeDataURL("");
        } finally {
            setIsLoadingQR(false);
        }
    }, [address]);

    const handleCastCard = useCallback(async () => {
        if (!address) return;
        const shareUrl = generateCardShareURL(address);
        const imageUrl = card?.imageUri
            ? resolveIpfsUrl(card.imageUri, ipfsGatewayUrl)
            : undefined;
        await shareToFarcaster({
            text: `Check out my Basecard! Collect this and see all about me 🎉`,
            imageUrl,
            embedUrl: shareUrl,
        });
    }, [address, card?.imageUri, ipfsGatewayUrl]);

    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div className="w-full flex flex-col items-center px-5 relative">
            <div
                className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-basecard-blue"
                style={{
                    backgroundImage: "url(/assets/mybasecard-background.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Card Action Button - Top Right */}
                {isProfile && (
                    <CardActionButton
                        onClick={handleNavigateToEdit}
                        icon={
                            <HiOutlinePencil className="text-white" size={18} />
                        }
                        label="Edit Profile"
                    />
                )}
                {isViewer && onClose && (
                    <CardActionButton
                        onClick={onClose}
                        icon={<IoClose className="text-white" size={22} />}
                        label="Close"
                    />
                )}

                {/* Content Wrapper */}
                <div className="relative z-10 w-full h-full flex flex-col items-center p-5">
                    {/* Profile Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/20 flex-none bg-black/20">
                        <Image
                            src={profileImageUrl}
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
                        {SOCIAL_ENTRIES.map(({ key, icon, label }) => {
                            const rawValue = socials?.[key] ?? "";
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
                                    disabled={!hasUrl}
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

                    {/* Bio */}
                    <div className="mt-4 w-full min-h-16 px-4 py-3 rounded-lg border border-[#3E7CFF]/50 bg-black/5 flex items-center justify-center">
                        <p className="font-medium text-sm leading-5 text-center text-white break-words w-full">
                            {card.bio || "Hi, I'm a base builder"}
                        </p>
                    </div>

                    {/* [PROFILE] Share Button / [VIEWER] Collect Button */}
                    {isProfile ? (
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
                    ) : (
                        <button
                            onClick={isCollected ? undefined : onCollect}
                            disabled={isCollected}
                            className={`mt-4 w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-colors
                                ${
                                    isCollected
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#0455FF] hover:bg-[#0344CC]"
                                }`}
                        >
                            {isCollected ? (
                                <>
                                    <IoCheckmarkCircle
                                        className="text-white"
                                        size={20}
                                    />
                                    <span className="font-medium text-base text-white">
                                        Collected
                                    </span>
                                </>
                            ) : (
                                <>
                                    <MdOutlineBookmarkAdd
                                        className="text-white"
                                        size={20}
                                    />
                                    <span className="font-medium text-base text-white">
                                        Collect
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Modals */}
                <ShareBottomSheet
                    isOpen={isShareSheetOpen}
                    onClose={() => setIsShareSheetOpen(false)}
                    onCopyLink={handleCopyLink}
                    onShareQR={handleShareQR}
                    onCastCard={handleCastCard}
                />

                <ShareModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    title="Share My Card"
                    profileImageUrl={
                        user?.profileImage
                            ? resolveIpfsUrl(user.profileImage, ipfsGatewayUrl)
                            : undefined
                    }
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

// =============================================================================
// Sub Components
// =============================================================================

function CardActionButton({
    onClick,
    icon,
    label,
}: {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className="absolute top-2 right-2 z-20 p-2 rounded-full flex justify-center items-center
                hover:bg-black/10 transition-colors active:scale-95"
            aria-label={label}
        >
            {icon}
        </button>
    );
}
