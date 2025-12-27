"use client";

import BaseButton from "@/components/buttons/BaseButton";
import {
    CardConnectWalletState,
    CardEmptyState,
    CardLoadingState,
} from "@/components/CardStates";
import { useUser } from "@/hooks/api/useUser";
import { getIPFSUrl } from "@/lib/utils";
import { QrCode } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CardShareModal } from "./CardShareModal";

export default function MyCardSection() {
    const router = useRouter();
    const { card, isPending: isLoading, error } = useUser();
    const [showShareFloating, setShowShareFloating] = useState(false);

    const handleMyCardClick = () => {
        router.push("/basecard");
    };

    const handleShareClick = () => {
        if (card) {
            setShowShareFloating(true);
        }
    };

    const handleCloseShareFloating = () => {
        setShowShareFloating(false);
    };

    return (
        <div className="relative w-full px-4 sm:px-6 flex flex-col justify-center items-center py-2 gap-4">
            {/* Title Section */}
            <h1 className="text-3xl sm:text-4xl font-k2d font-bold text-left tracking-tighter leading-tight">
                Onchain social ID Card
            </h1>

            {/* Card Image Section - Takes up remaining space */}
            <div className="w-full rounded-2xl sm:rounded-3xl relative">
                {isLoading ? (
                    // Loading state
                    <CardLoadingState />
                ) : error ? (
                    // Error state - No card found
                    <CardEmptyState />
                ) : card ? (
                    // Card found - Display image (clickable)
                    <div className="flex flex-col w-full">
                        <div className="drop-shadow-xl p-2">
                            <div
                                onClick={handleMyCardClick}
                                className="relative w-full h-52 transition-all duration-300 overflow-visible select-none"
                            >
                                {card?.imageUri && (
                                    <Image
                                        src={getIPFSUrl(card.imageUri)}
                                        alt={`${card.nickname}'s BaseCard`}
                                        fill
                                        className="object-contain h-full select-none"
                                        priority
                                    />
                                )}
                            </div>
                        </div>
                        {/* Buttons Section */}
                        <div className="w-full flex gap-x-3 px-2 my-5">
                            <BaseButton
                                onClick={handleShareClick}
                                disabled={!card}
                                className="w-full bg-basecard-black"
                                leftIcon={<QrCode size={18} />}
                            >
                                Share Code
                            </BaseButton>
                        </div>
                    </div>
                ) : (
                    // No wallet connected
                    <CardConnectWalletState />
                )}
            </div>

            {card && (
                <CardShareModal
                    isVisible={showShareFloating}
                    onClose={handleCloseShareFloating}
                    card={card}
                />
            )}
        </div>
    );
}
