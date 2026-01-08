"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoQrCode } from "react-icons/io5";
import FarcasterIcon from "../icons/FarcasterIcon";

const WARPCAST_CLIENT_FID = 9152;

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    profileImageUrl?: string;
    name?: string;
    subtitle?: string;
    qrCodeDataURL?: string;
    isLoadingQR?: boolean;
    qrErrorMessage?: string;
    logoSrc?: string;
    onCastCard?: () => void;
    clientFid?: number;
}

/**
 * Share Modal with QR code display
 */
export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    title = "Share My Card",
    profileImageUrl,
    name,
    subtitle,
    qrCodeDataURL,
    isLoadingQR = false,
    qrErrorMessage = "Failed to generate QR code",
    logoSrc,
    onCastCard,
    clientFid,
}) => {
    const isWarpcast = clientFid === WARPCAST_CLIENT_FID;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur p-5
                transition-all duration-300
                ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
                    relative w-full max-w-[400px] overflow-hidden rounded-3xl
                    bg-gradient-to-b from-white to-gray-50 shadow-2xl
                    transform transition-all duration-300 ease-out
                    ${isOpen ? "scale-100 translate-y-0" : "scale-90 translate-y-8"}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="absolute top-0 left-0 right-0 h-32 pointer-events-none
                        bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-cyan-500/10"
                />
                {/* Header */}
                <div className="relative pt-6 pb-4 px-6 w-full">
                    <h2 className="text-lg font-bold text-gray-900 text-center">
                        {title}
                    </h2>
                </div>

                {/* Profile Card */}
                {(profileImageUrl || name) && (
                    <div
                        className="relative mx-4 p-4 rounded-xl
                            bg-gradient-to-br from-blue-700 to-blue-500"
                    >
                        <div className="relative flex items-center gap-3">
                            {profileImageUrl && (
                                <div
                                    className="relative w-14 h-14 rounded-xl overflow-hidden
                                        ring-2 ring-white/30 shadow-lg"
                                >
                                    <Image
                                        src={profileImageUrl}
                                        alt="profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {logoSrc && (
                                        <Image
                                            src={logoSrc}
                                            alt="logo"
                                            width={18}
                                            height={18}
                                            className="w-[18px] h-[18px]"
                                        />
                                    )}
                                    {name && (
                                        <span className="text-white font-bold text-base truncate">
                                            {name}
                                        </span>
                                    )}
                                </div>
                                {subtitle && (
                                    <p className="text-white/80 text-sm mt-0.5 truncate">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code Section */}
                <div className="px-4 pt-5">
                    <div
                        className="relative p-4 rounded-xl bg-white
                            shadow-inner shadow-black/40 border border-gray-100"
                    >
                        {/* QR Label */}
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            <IoQrCode className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Scan to collect
                            </span>
                        </div>

                        {/* QR Code */}
                        <div className="flex items-center justify-center">
                            {isLoadingQR ? (
                                <div className="w-[160px] h-[160px] flex items-center justify-center">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                                        <div
                                            className="absolute inset-0 rounded-full border-4
                                                border-blue-500 border-t-transparent animate-spin"
                                        />
                                    </div>
                                </div>
                            ) : qrCodeDataURL ? (
                                <div className="relative p-2 rounded-xl bg-white">
                                    <img
                                        src={qrCodeDataURL}
                                        alt="QR Code"
                                        className="w-[160px] h-[160px]"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-[160px] h-[160px] rounded-xl bg-red-50
                                        flex flex-col items-center justify-center gap-2 text-red-400"
                                >
                                    <IoQrCode className="w-8 h-8" />
                                    <span className="text-xs text-center px-4">
                                        {qrErrorMessage}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full p-4 flex flex-col gap-2">
                    {onCastCard && (
                        <button
                            onClick={() => {
                                onCastCard();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-white  font-medium text-[#007AFF]
                                flex items-center justify-center gap-2 border border-gray-200
                                hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            {isWarpcast ? (
                                <FarcasterIcon className="w-5 h-5 " />
                            ) : (
                                <Image
                                    src="/assets/base_square_blue.svg"
                                    alt="Base"
                                    width={20}
                                    height={20}
                                />
                            )}
                            Cast my Card
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full text-sm font-medium text-gray-500 
                            hover:text-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ShareModal;
