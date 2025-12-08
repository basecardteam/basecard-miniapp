"use client";

import BaseButton from "@/components/buttons/BaseButton";
import { memo, useMemo } from "react";
import { IoCheckmarkCircle, IoSparkles } from "react-icons/io5";

interface MintButtonProps {
    isGenerating: boolean; // Backend creation
    isMintPending: boolean; // Wallet signature
    isMintConfirming: boolean; // Transaction mining
    isMintSuccess: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * 민팅 버튼 컴포넌트
 */
export const MintButton = memo(function MintButton({
    isGenerating,
    isMintPending,
    isMintConfirming,
    isMintSuccess,
    onSubmit,
}: MintButtonProps) {
    const isLoading = isGenerating || isMintPending || isMintConfirming;

    const { buttonText, icon, variant } = useMemo(() => {
        if (isGenerating) {
            return {
                buttonText: "Creating Your Card...",
                icon: null,
                variant: "default" as const,
            };
        }
        if (isMintPending) {
            return {
                buttonText: "Approve in Wallet...",
                icon: null,
                variant: "default" as const,
            };
        }
        if (isMintConfirming) {
            return {
                buttonText: "Finalizing...",
                icon: null,
                variant: "default" as const,
            };
        }
        if (isMintSuccess) {
            return {
                buttonText: "All Done!",
                icon: <IoCheckmarkCircle className="w-5 h-5" />,
                variant: "default" as const, // BaseButton doesn't have success variant by default, keeping default or could use secondary
            };
        }
        return {
            buttonText: "Create My Card",
            variant: "default" as const,
        };
    }, [isGenerating, isMintPending, isMintConfirming, isMintSuccess]);

    return (
        <BaseButton
            type="submit"
            onClick={onSubmit}
            disabled={isLoading || isMintSuccess}
            isLoading={isLoading}
            variant={variant}
            leftIcon={!isLoading ? icon : undefined}
            className="w-full py-6 text-lg rounded-2xl shadow-xl mt-6"
        >
            {buttonText}
        </BaseButton>
    );
});
