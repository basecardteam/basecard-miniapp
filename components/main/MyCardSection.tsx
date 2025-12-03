"use client";

import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { walletAddressAtom } from "@/store/walletState";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CardShareModal } from "./CardShareModal";

export default function MyCardSection() {
    const router = useRouter();
    const [address] = useAtom(walletAddressAtom);
    const { data: card, isLoading, error } = useMyBaseCard(address);
    const [showShareFloating, setShowShareFloating] = useState(false);

    // IPFS Gateway URL
    const getIPFSUrl = (cid: string) => {
        if (!cid) return "/assets/default-profile.png";
        return `https://ipfs.io/ipfs/${cid.replace("ipfs://", "")}`;
    };

    const handleMyCardClick = () => {
        router.push("/mycard");
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
        <div className="relative w-full px-4 sm:px-6 md:px-8 flex flex-col justify-center items-center py-3 sm:py-4 gap-4 sm:gap-6">
            {/* Title Section */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-k2d-bold text-left tracking-tight leading-tight">
                Onchain social
                <br />
                Business Card
            </h1>

            {/* Card Image Section - Takes up remaining space */}
            <div className="w-full rounded-2xl sm:rounded-3xl relative">
                {isLoading ? (
                    // Loading state
                    <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                        <div className="animate-pulse text-gray-400 text-lg">
                            Loading your card...
                        </div>
                    </div>
                ) : error ? (
                    // Error state - No card found
                    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-3">
                        <p className="text-gray-500 text-base">
                            No BaseCard yet
                        </p>
                    </div>
                ) : card ? (
                    // Card found - Display image (clickable)
                    <div className=" drop-shadow-xl p-2">
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
                ) : (
                    // No wallet connected
                    <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                        <p className="text-gray-500 text-base">
                            Connect wallet to view your card
                        </p>
                    </div>
                )}
            </div>

            {/* Buttons Section */}
            <div className="w-full flex gap-x-3">
                <button
                    onClick={handleShareClick}
                    disabled={!card}
                    className={`flex py-4 w-full rounded-xl justify-center items-center text-white font-semibold text-sm ${
                        card ? "bg-button-1 " : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    Share
                </button>
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
