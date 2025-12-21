"use client";

import BaseButton from "@/components/buttons/BaseButton";

interface MintSuccessModalProps {
    isOpen: boolean;
    txHash: string;
    explorerUrl: string;
    onViewCard: () => void;
    onShare: () => void;
    isExisting?: boolean;
}

export default function MintSuccessModal({
    isOpen,
    txHash,
    explorerUrl,
    onViewCard,
    onShare,
    isExisting = false,
}: MintSuccessModalProps) {
    if (!isOpen) return null;

    const handleViewTransaction = () => {
        window.open(`${explorerUrl}/tx/${txHash}`, "_blank");
    };

    const title = isExisting ? "You Already Have a BaseCard!" : "Successfully Minted";
    const description = isExisting
        ? "You can view your existing card or share it with others."
        : "Your BaseCard is ready to share!";

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center transition-opacity duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" />

            {/* Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-5 text-white max-w-sm text-center">
                <div className="flex flex-col justify-center items-center mt-auto">
                    {/* Title */}
                    <h2 className="text-2xl font-extrabold mb-3 leading-snug text-[#007aff]">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-base font-medium text-gray-300 mb-6">
                        {description}
                    </p>

                    {/* View Transaction Link */}
                    <button
                        onClick={handleViewTransaction}
                        className="flex items-center gap-1 border-b border-[#60A5FA] pb-0.5 mb-6 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-sm font-semibold text-[#60A5FA]">
                            View Transaction
                        </span>
                        <span className="text-xs text-[#60A5FA]">→</span>
                    </button>
                </div>

                {/* Buttons */}
                <div
                    className="mt-auto w-full flex flex-col gap-3"
                    style={{ marginBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
                >
                    {/* Primary Button - View My Card */}
                    <BaseButton
                        onClick={onViewCard}
                        className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-base font-semibold"
                    >
                        View My Card
                    </BaseButton>

                    {/* Secondary Button - Share */}
                    <BaseButton
                        onClick={onShare}
                        className="w-full h-14 bg-transparent border-2 border-white/30 hover:border-white/50 text-white rounded-lg text-base font-semibold"
                    >
                        Share
                    </BaseButton>
                </div>
            </div>
        </div>
    );
}
