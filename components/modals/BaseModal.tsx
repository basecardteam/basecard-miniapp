"use client";

import BaseButton from "@/components/buttons/BaseButton";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    buttonText?: string;
    variant?: "success" | "error" | "default";
    onButtonClick?: () => void;
    linkText?: string;
    onLinkClick?: () => void;
}

export const BaseModal = ({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "Okay",
    variant = "default",
    onButtonClick,
    linkText,
    onLinkClick,
}: BaseModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    const titleColor = {
        success: "text-[#0050FF]", // Fixed Blue
        error: "text-[#EF4444]", // Red-500
        default: "text-[#0050FF]",
    }[variant];

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content - Fixed Size 320x300 */}
            <div
                className={`relative w-[320px] h-[300px] bg-[#F9F9FF] rounded-[8px] flex flex-col items-center shadow-[0px_4px_6px_rgba(225,228,230,0.15)] transform transition-all duration-300 ${
                    isOpen
                        ? "scale-100 translate-y-0"
                        : "scale-95 translate-y-4"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - Top 16px Right 16px */}
                <button
                    onClick={onClose}
                    className="absolute top-[16px] right-[16px] w-[24px] h-[24px] flex items-center justify-center text-[#B0B0B0] hover:text-[#808080] transition-colors"
                >
                    <IoClose size={24} />
                </button>

                {/* Content Container - Starts at top 87px roughly, centered horizontally */}
                <div className="flex flex-col items-center mt-[87px] gap-[12px] w-[261px]">
                    {/* Title */}
                    <h2
                        className={`text-[17px] leading-[26px] font-semibold font-k2d text-center ${titleColor}`}
                    >
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-[14px] leading-[20px] font-normal font-k2d text-[#252423] text-center w-full">
                        {description}
                    </p>

                    {/* Optional Link */}
                    {linkText && onLinkClick && (
                        <button
                            onClick={onLinkClick}
                            className="flex items-center gap-[4px] border-b border-[#0050FF] pb-[2px] hover:opacity-80 transition-opacity"
                        >
                            <span className="text-[12px] leading-[14px] font-semibold font-k2d text-[#0050FF] tracking-tight">
                                {linkText}
                            </span>
                            <span className="text-[10px] text-[#0050FF]">
                                →
                            </span>
                        </button>
                    )}
                </div>

                {/* Primary Button - Positioned at bottom area (top 246px per spec, but flexbox push down is better) */}
                <div className="absolute top-[246px] w-[300px]">
                    <BaseButton
                        onClick={onButtonClick || onClose}
                        className="w-full h-[41px] bg-[#303030] hover:bg-[#202020] text-[#F5F5F5] rounded-[8px] text-[16px] font-semibold font-k2d p-0"
                    >
                        {buttonText}
                    </BaseButton>
                </div>
            </div>
        </div>
    );
};
