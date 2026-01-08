"use client";

import { useCallback, useRef, useState } from "react";
import { IoCopyOutline, IoQrCode } from "react-icons/io5";
import Image from "next/image";
import FarcasterIcon from "../icons/FarcasterIcon";

interface ShareOption {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const WARPCAST_CLIENT_FID = 9152;

interface ShareBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCopyLink: () => void;
    onShareQR: () => void;
    onCastCard: () => void;
    clientFid?: number;
}

export default function ShareBottomSheet({
    isOpen,
    onClose,
    onCopyLink,
    onShareQR,
    onCastCard,
    clientFid,
}: ShareBottomSheetProps) {
    const isWarpcast = clientFid === WARPCAST_CLIENT_FID;
    const [isClosing, setIsClosing] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [closingWithDrag, setClosingWithDrag] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef(0);
    const lastTouchTimeRef = useRef(0);

    const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
        if (e.animationName === "shareSheetSlideUp") {
            setHasAnimatedIn(true);
        }
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setHasAnimatedIn(false);
            setDragY(0);
            onClose();
        }, 250);
    }, [onClose]);

    const handleDragClose = useCallback(() => {
        setClosingWithDrag(true);
        const sheetHeight = sheetRef.current?.offsetHeight || 400;
        setDragY(sheetHeight);
        setTimeout(() => {
            setClosingWithDrag(false);
            setHasAnimatedIn(false);
            setDragY(0);
            onClose();
        }, 250);
    }, [onClose]);

    const handleDragHandleTouchStart = useCallback((e: React.TouchEvent) => {
        startYRef.current = e.touches[0].clientY;
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isDragging) return;
            const currentY = e.touches[0].clientY;
            const diff = currentY - startYRef.current;
            if (diff > 0) {
                setDragY(diff);
            }
        },
        [isDragging]
    );

    const handleDragHandleTouchEnd = useCallback(() => {
        lastTouchTimeRef.current = Date.now();
        setIsDragging(false);
        if (dragY > 100) {
            handleDragClose();
        } else {
            setDragY(0);
        }
    }, [dragY, handleDragClose]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            const timeSinceTouch = Date.now() - lastTouchTimeRef.current;
            if (timeSinceTouch < 300) {
                return;
            }
            if (e.target === e.currentTarget) {
                handleClose();
            }
        },
        [handleClose]
    );

    const handleOptionClick = useCallback(
        (action: () => void) => {
            action();
            handleClose();
        },
        [handleClose]
    );

    if (!isOpen && !isClosing) return null;

    const shareOptions: ShareOption[] = [
        {
            id: "copy-link",
            label: "Copy Link",
            icon: <IoCopyOutline size={22} className="text-[#007AFF]" />,
            onClick: onCopyLink,
        },
        {
            id: "share-qr",
            label: "Share with QR",
            icon: <IoQrCode size={22} className="text-[#007AFF]" />,
            onClick: onShareQR,
        },
        {
            id: "cast-card",
            label: isWarpcast ? "Cast my Card" : "Share to Base",
            icon: isWarpcast ? (
                <FarcasterIcon className="w-5 h-5 text-[#007aff]" />
            ) : (
                <Image
                    src="/assets/base_square_blue.svg"
                    alt="Base"
                    width={22}
                    height={22}
                />
            ),
            onClick: onCastCard,
        },
    ];

    return (
        <div className="fixed inset-0 z-[9999]">
            <style>
                {`
                @keyframes shareSheetFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shareSheetFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes shareSheetSlideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes shareSheetSlideDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
                `}
            </style>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"
                style={{
                    animation: isClosing
                        ? "shareSheetFadeOut 250ms ease-out forwards"
                        : "shareSheetFadeIn 250ms ease-out forwards",
                }}
                onClick={handleBackdropClick}
                onTouchEnd={(e) => {
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                        handleClose();
                    }
                }}
            />

            {/* Bottom Sheet Container */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 px-3 z-10"
                style={{
                    paddingBottom: "calc(12px + var(--bottom-nav-h, 64px) + env(safe-area-inset-bottom, 0px))",
                    transform: (isDragging || closingWithDrag) ? `translateY(${dragY}px)` : undefined,
                    animation:
                        isDragging || closingWithDrag
                            ? "none"
                            : isClosing
                                ? "shareSheetSlideDown 250ms ease-out forwards"
                                : hasAnimatedIn
                                    ? "none"
                                    : "shareSheetSlideUp 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
                    transition: isDragging ? "none" : "transform 250ms ease-out",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchMove={handleTouchMove}
                onAnimationEnd={handleAnimationEnd}
            >
                {/* Share Options Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl mb-2">
                    {/* Drag Handle */}
                    <div
                        className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                        onTouchStart={handleDragHandleTouchStart}
                        onTouchEnd={handleDragHandleTouchEnd}
                    >
                        <div className="w-9 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Title */}
                    <div className="px-4 pb-3 pt-1">
                        <p className="text-center text-sm font-medium text-gray-500">
                            Share your card
                        </p>
                    </div>

                    {/* Options List */}
                    <div className="border-t border-gray-200/80">
                        {shareOptions.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.onClick)}
                                className={`w-full flex items-center gap-4 px-5 py-4
                                    hover:bg-gray-100/80 active:bg-gray-200/80 transition-colors
                                    ${index !== shareOptions.length - 1 ? "border-b border-gray-200/80" : ""}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                                    {option.icon}
                                </div>
                                <span className="text-base font-medium text-gray-900">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={handleClose}
                    className="w-full bg-white/95 backdrop-blur-xl rounded-2xl py-4
                        text-[#007AFF] text-base font-semibold shadow-xl
                        hover:bg-gray-100/95 active:bg-gray-200/95 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
