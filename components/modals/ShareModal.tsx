"use client";

import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import BaseButton from "@/components/buttons/BaseButton";
import { shareToFarcaster } from "@/lib/farcaster/share";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Content props
    title?: string;
    profileImageUrl?: string;
    profileImageAlt?: string;
    name?: string;
    subtitle?: string;
    // QR Code props
    qrCodeDataURL?: string;
    isLoadingQR?: boolean;
    qrErrorMessage?: string;
    // Logo
    logoSrc?: string;
    // Share props
    shareUrl?: string; // URL to share (e.g., card page URL)
    shareText?: string; // Default share message
    // Button
    buttonText?: string;
    onShareComplete?: (success: boolean) => void;
}

/**
 * Reusable Share Modal component with QR code display and Farcaster share.
 * Uses Farcaster SDK composeCast when in Mini App, falls back to Warpcast intent URL.
 */
export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    title = "Share My Card",
    profileImageUrl,
    profileImageAlt = "Profile",
    name,
    subtitle,
    qrCodeDataURL,
    isLoadingQR = false,
    qrErrorMessage = "Failed to generate QR code",
    logoSrc,
    shareUrl,
    shareText = "I just minted my Basecard! Collect this and check all about myself 🎉",
    buttonText = "Share on Farcaster",
    onShareComplete,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    /**
     * Share to Farcaster using SDK (Mini App) or Warpcast intent (browser fallback)
     */
    const handleShareToFarcaster = useCallback(async () => {
        setIsSharing(true);

        try {
            const result = await shareToFarcaster({
                text: shareText,
                embedUrl: shareUrl,
            });

            if (onShareComplete) {
                onShareComplete(result.success);
            }
        } catch (error) {
            console.error("Share failed:", error);
            if (onShareComplete) {
                onShareComplete(false);
            }
        } finally {
            setIsSharing(false);
        }
    }, [shareText, shareUrl, onShareComplete]);

    if (!isOpen && !isVisible) return null;

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-[320px] bg-[#F9F9FF] rounded-[12px] flex flex-col items-center shadow-[0px_4px_6px_rgba(225,228,230,0.15)] transform transition-all duration-300 overflow-hidden ${
                    isOpen
                        ? "scale-100 translate-y-0"
                        : "scale-95 translate-y-4"
                }`}
                onClick={handleModalClick}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-[16px] right-[16px] w-[24px] h-[24px] flex items-center justify-center text-[#B0B0B0] hover:text-[#808080] transition-colors z-10"
                >
                    <IoClose size={24} />
                </button>

                {/* Header */}
                <div className="mt-[16px] mb-[16px]">
                    <h2 className="text-[17px] leading-[26px] font-semibold font-k2d text-center text-[#0050FF]">
                        {title}
                    </h2>
                </div>

                {/* Profile Section */}
                {profileImageUrl && (
                    <div className="flex flex-col items-center justify-center mb-[12px]">
                        <div className="w-[80px] h-[80px] rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={profileImageUrl}
                                alt={profileImageAlt}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Name and subtitle with optional logo */}
                        <div className="text-center mt-[12px] text-[#0050FF]">
                            <div className="flex gap-x-2 justify-center items-center">
                                {logoSrc && (
                                    <Image
                                        src={logoSrc}
                                        alt="logo"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                )}
                                {name && (
                                    <div className="text-[16px] font-bold font-k2d">
                                        {name}
                                    </div>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-[12px] font-semibold font-k2d mt-[2px]">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="w-[280px] h-[1px] bg-gray-200 my-[8px]" />

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center py-[12px]">
                    {isLoadingQR ? (
                        <div className="w-[180px] h-[180px] flex items-center justify-center">
                            <svg
                                className="animate-spin h-10 w-10 text-[#0050FF]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                    ) : qrCodeDataURL ? (
                        <img
                            src={qrCodeDataURL}
                            alt="QR Code"
                            className="w-[180px] h-[180px] p-2"
                        />
                    ) : (
                        <div className="w-[180px] h-[180px] flex items-center justify-center text-red-500 border border-red-300 rounded-lg text-sm">
                            {qrErrorMessage}
                        </div>
                    )}
                </div>

                {/* Share Button */}
                <div className="w-full px-[10px] pb-[16px]">
                    <BaseButton
                        onClick={handleShareToFarcaster}
                        disabled={isSharing}
                        className="w-full h-[41px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[8px] text-[16px] font-semibold font-k2d p-0 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M18.24 0.24H5.76C2.57 0.24 0 2.81 0 6v12c0 3.19 2.57 5.76 5.76 5.76h12.48c3.19 0 5.76-2.57 5.76-5.76V6c0-3.19-2.57-5.76-5.76-5.76zM19.52 18c0 .83-.67 1.5-1.5 1.5H5.98c-.83 0-1.5-.67-1.5-1.5V6c0-.83.67-1.5 1.5-1.5h12.04c.83 0 1.5.67 1.5 1.5v12z" />
                        </svg>
                        {buttonText}
                    </BaseButton>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
