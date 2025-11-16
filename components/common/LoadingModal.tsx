"use client";

import { useEffect, useState } from "react";

interface LoadingModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
    showSpinner?: boolean;
}

export default function LoadingModal({
    isOpen,
    title = "Processing...",
    description = "Please wait a moment",
    showSpinner = true,
}: LoadingModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen
                ? "bg-black/40 backdrop-blur-md"
                : "bg-transparent backdrop-blur-0 pointer-events-none"
                }`}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className={`relative w-[90%] max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-center items-center shadow-2xl border border-white/20 transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
                style={{
                    boxShadow: "0 20px 60px rgba(0, 80, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
            >
                {/* Content */}
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    {/* Modern Spinner */}
                    {showSpinner && (
                        <div className="relative w-20 h-20">
                            {/* Outer ring with gradient */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white"></div>
                            </div>
                            {/* Spinning ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
                            {/* Inner pulsing dot */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {title}
                        </h2>

                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-2 pt-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: "1.5s",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
