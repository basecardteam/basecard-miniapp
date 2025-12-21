"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface BaseLoadingModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
}

const FullScreenLoadingOverlay = ({ 
    isOpen,
    title = "Processing Transaction",
    description = "Please wait a moment",
}: BaseLoadingModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden'; 
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen,]);

    if (!isOpen && !isVisible) return null;

    return (
        // Full Screen Overlay: z-index를 높게 설정하여 모든 요소를 덮음
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            {/* 1. Backdrop: 배경을 어둡게 하고 강력한 블러 효과 추가 */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" />

            {/* 2. Content Area (중앙 집중식) */}
            <div
                className={`relative flex flex-col items-center justify-center p-8 
                    transform transition-all duration-300 ease-out 
                    text-white max-w-sm text-center
                    ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
            >
                {/* Spinner: 심플하고 강력한 시각 효과 */}
                <div className="flex items-center justify-center mb-6">
                    <Loader 
                        className="w-12 h-12 text-basecard-blue animate-spin" // 밝은 하늘색(Sky-400) 계열
                    />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-extrabold mb-3 leading-snug">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-base font-medium text-gray-300">
                    {description}
                </p>
            </div>
            
            {/* 3. Footer Indicator (선택 사항: 로딩이 계속되고 있음을 시각화) */}
            <div
                className="absolute left-0 right-0 h-1"
                style={{ bottom: "env(safe-area-inset-bottom, 0px)" }}
            >
                <div
                    className="h-full bg-gradient-to-r from-transparent via-basecard-blue to-transparent animate-pulse"
                />
            </div>
        </div>
    );
};

export default FullScreenLoadingOverlay;