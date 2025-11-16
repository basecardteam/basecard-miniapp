"use client";

import { useEffect, useState } from "react";
import { IoClose, IoWarning } from "react-icons/io5";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export default function WarningModal({
    isOpen,
    onClose,
    title = "Notice",
    description = "Please check your input.",
    buttonText = "OK",
}: WarningModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-black/40 backdrop-blur-md" : "bg-transparent backdrop-blur-0 pointer-events-none"
                }`}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className={`relative w-[90%] max-w-md bg-white rounded-3xl p-8 flex flex-col shadow-2xl border border-white/20 transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow: "0 20px 60px rgba(234, 179, 8, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                    <IoClose size={20} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 pt-4">
                    {/* Warning Icon with animation */}
                    <div
                        className={`relative w-24 h-24 transition-all duration-500 ${isAnimating ? "scale-100 rotate-0" : "scale-0 rotate-180"
                            }`}
                    >
                        {/* Animated circle background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full animate-pulse"></div>
                        <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center">
                            <IoWarning
                                className={`text-5xl text-amber-500 transition-all duration-500 ${isAnimating ? "scale-100" : "scale-0"
                                    }`}
                            />
                        </div>
                        {/* Gentle pulse effect */}
                        {isAnimating && (
                            <div className="absolute inset-0 border-4 border-amber-400 rounded-full animate-ping opacity-50"></div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                            {title}
                        </h2>

                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Action button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-4 rounded-xl font-semibold text-base hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
