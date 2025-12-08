"use client";

import { useEffect, useState } from "react";

interface BaseLoadingModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
}

export const BaseLoadingModal = ({
    isOpen,
    title = "Processing...",
    description = "Please wait a moment",
}: BaseLoadingModalProps) => {
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

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal Content - Same size as BaseAlertModal: 320x300 */}
            <div
                className={`relative w-[320px] h-[300px] bg-[#F9F9FF] rounded-[8px] flex flex-col items-center justify-center shadow-[0px_4px_6px_rgba(225,228,230,0.15)] transform transition-all duration-300 ${
                    isOpen
                        ? "scale-100 translate-y-0"
                        : "scale-95 translate-y-4"
                }`}
            >
                {/* Spinner - Bouncing Dots */}
                <div className="flex items-center justify-center gap-1.5 mb-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-basecard-blue rounded-full"
                            style={{
                                animation: "bounce 1.4s ease-in-out infinite",
                                animationDelay: `${i * 0.16}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Content Container */}
                <div className="flex flex-col items-center gap-[12px] w-[261px]">
                    {/* Title */}
                    <h2 className="text-[17px] leading-[26px] font-semibold font-k2d text-center text-basecard-blue">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-[14px] leading-[20px] font-normal font-k2d text-basecard-black text-center w-full">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BaseLoadingModal;
