"use client";

import { memo, useMemo } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { IoCheckmarkCircle, IoSparkles } from "react-icons/io5";

interface MintButtonProps {
    isGenerating: boolean;
    isMintPending: boolean;
    isMintConfirming: boolean;
    isMintSuccess: boolean;
    isWalletNotReady: boolean;
    hasAddress: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * 민팅 버튼 컴포넌트 - 최신 디자인 트렌드 반영
 */
export const MintButton = memo(function MintButton({
    isGenerating,
    isMintPending,
    isMintConfirming,
    isMintSuccess,
    isWalletNotReady,
    hasAddress,
    onSubmit,
}: MintButtonProps) {
    const isDisabled = useMemo(
        () =>
            isGenerating ||
            isMintPending ||
            isMintConfirming ||
            isWalletNotReady ||
            !hasAddress,
        [isGenerating, isMintPending, isMintConfirming, isWalletNotReady, hasAddress]
    );

    const { buttonText, icon, variant } = useMemo(() => {
        if (isWalletNotReady) {
            return {
                buttonText: "Connecting...",
                icon: <AiOutlineLoading className="w-5 h-5 animate-spin" />,
                variant: "loading" as const,
            };
        }
        if (!hasAddress) {
            return {
                buttonText: "Connect Wallet",
                icon: null,
                variant: "disabled" as const,
            };
        }
        if (isGenerating) {
            return {
                buttonText: "Creating Your Card...",
                icon: <AiOutlineLoading className="w-5 h-5 animate-spin" />,
                variant: "generating" as const,
            };
        }
        if (isMintPending) {
            return {
                buttonText: "Almost There...",
                icon: <AiOutlineLoading className="w-5 h-5 animate-spin" />,
                variant: "pending" as const,
            };
        }
        if (isMintConfirming) {
            return {
                buttonText: "Final Step...",
                icon: <AiOutlineLoading className="w-5 h-5 animate-spin" />,
                variant: "confirming" as const,
            };
        }
        if (isMintSuccess) {
            return {
                buttonText: "All Done!",
                icon: <IoCheckmarkCircle className="w-5 h-5" />,
                variant: "success" as const,
            };
        }
        return {
            buttonText: "Create My Card",
            icon: <IoSparkles className="w-5 h-5" />,
            variant: "default" as const,
        };
    }, [isWalletNotReady, hasAddress, isGenerating, isMintPending, isMintConfirming, isMintSuccess]);

    // 버튼 스타일 클래스 결정
    const buttonClasses = useMemo(() => {
        const baseClasses =
            "w-full py-4 px-6 mt-6 text-lg font-k2d-semibold rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 min-h-[56px] disabled:cursor-not-allowed disabled:opacity-70 relative overflow-hidden";

        if (isDisabled) {
            return `${baseClasses} bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed`;
        }

        if (isMintSuccess) {
            return `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]`;
        }

        if (isGenerating || isMintPending || isMintConfirming) {
            return `${baseClasses} bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white hover:shadow-2xl animate-gradient-x bg-[length:200%_100%]`;
        }

        // Default state - 그라데이션 배경
        return `${baseClasses} bg-gradient-to-r from-[#0050FF] via-[#4A90E2] to-[#0050FF] text-white hover:from-[#0066FF] hover:via-[#5AA0F2] hover:to-[#0066FF] hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] animate-gradient-x`;
    }, [isDisabled, isMintSuccess, isGenerating, isMintPending, isMintConfirming]);

    return (
        <button
            type="submit"
            disabled={isDisabled}
            onClick={onSubmit}
            className={buttonClasses}
        >
            {/* Shine effect for default state */}
            {!isDisabled && !isMintSuccess && (variant === "default" || variant === "generating" || variant === "pending" || variant === "confirming") && (
                <span className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            )}

            {/* Icon */}
            {icon && (
                <span className={`flex items-center ${variant === "success" ? "animate-scale-in" : ""}`}>
                    {icon}
                </span>
            )}

            {/* Text */}
            <span className="relative z-10">{buttonText}</span>

            {/* Ripple effect on click */}
            <span className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/10"></span>
        </button>
    );
});
