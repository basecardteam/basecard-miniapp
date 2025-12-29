"use client";

import BaseButton from "@/components/buttons/BaseButton";

interface SyncWaitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SyncWaitModal({ isOpen, onClose }: SyncWaitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center transition-opacity duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" />

            {/* Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-5 text-white max-w-sm text-center">
                <div className="flex flex-col justify-center items-center mt-auto">
                    {/* Title */}
                    <h2 className="text-2xl font-extrabold mb-3 leading-snug text-[#007aff]">
                        Syncing Your Card
                    </h2>

                    {/* Description */}
                    <p className="text-base font-medium text-gray-300 mb-6">
                        Wait for a while to sync your card...
                    </p>
                </div>

                {/* Buttons */}
                <div
                    className="mt-auto w-full flex flex-col gap-3"
                    style={{
                        marginBottom:
                            "calc(20px + env(safe-area-inset-bottom, 0px))",
                    }}
                >
                    <BaseButton
                        onClick={onClose}
                        className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-base font-semibold"
                    >
                        Okay, I&apos;ll wait
                    </BaseButton>
                </div>
            </div>
        </div>
    );
}
