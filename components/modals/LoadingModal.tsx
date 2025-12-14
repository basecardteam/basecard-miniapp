"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react"; // 깔끔한 스피너 아이콘 사용

interface BaseLoadingModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
}

export const BaseLoadingModal = ({
    isOpen,
    title = "Processing Request",
    description = "Please wait a moment",
}: BaseLoadingModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // 모달이 열리면 스크롤 방지
            document.body.style.overflow = 'hidden'; 
        } else {
            // 닫힐 때 페이드 아웃 애니메이션 완료를 위한 지연 (300ms)
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            {/* Backdrop: 배경을 어둡게 하고 부드러운 블러 효과 추가 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content - 기존 크기 (320px x 300px) 유지 및 세련된 디자인 적용 */}
            <div
                className={`relative w-[320px] h-[300px] bg-white rounded-xl flex flex-col items-center justify-center 
                    shadow-2xl shadow-gray-500/30 border border-gray-100 
                    transform transition-all duration-300 ease-out 
                    ${
                        isOpen
                            ? "scale-100 opacity-100"
                            : "scale-95 opacity-0"
                    }`}
            >
                {/* 1. Spinner Area: Loader 아이콘을 사용한 부드러운 회전 애니메이션 */}
                <div className="flex items-center justify-center mb-6">
                    <Loader 
                        className="w-10 h-10 text-[#4F46E5] animate-spin" // 인디고 계열의 세련된 색상
                    />
                </div>

                {/* 2. Content Container */}
                <div className="flex flex-col items-center gap-2 w-[261px]">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 text-center">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm font-medium text-gray-500 text-center w-full">
                        {description}
                    </p>
                </div>
                
                {/* 3. Footer / Edge Effect (선택적) */}
                <div className="absolute bottom-0 w-full h-1 bg-[#4F46E5] rounded-b-xl opacity-80" />
            </div>
        </div>
    );
};

export default BaseLoadingModal;