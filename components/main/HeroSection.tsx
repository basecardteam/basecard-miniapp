"use client";

import LandingBG from "@/public/assets/landing-page-backgrou.webp";
import LandingCard from "@/public/assets/landing-page-background-card.webp";
import BaseButton from "@/components/ui/BaseButton";
import Image from "next/image";

interface HeroSectionProps {
    onMintClick: () => void;
}

export default function HeroSection({ onMintClick }: HeroSectionProps) {
    return (
        <div className="relative h-fit z-10 flex flex-col px-4 sm:px-6 py-4 gap-y-4">
            <Image
                src={LandingBG}
                alt="landing-page-background-image"
                className="absolute inset-0 bg-no-repeat responsive-bg object-fill w-full"
                fill
            />
            {/* Title Section */}
            <div className="text-left">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-k2d-bold text-white mb-2 drop-shadow-lg tracking-tight leading-tight">
                    Onchain social
                    <br />
                    business card
                </h1>
                <p className="text-lg sm:text-2xl font-k2d-medium text-white max-w-2xl drop-shadow-md tracking-normal">
                    Turn your onchain story into
                    <br />
                    opportunity
                </p>
            </div>

            <div className="flex justify-center items-center">
                <Image
                    src={LandingCard}
                    height={220}
                    alt="landing-page-card"
                    priority
                    className="object-contain z-50"
                />
            </div>

            {/* Mint Button */}
            <BaseButton
                onClick={onMintClick}
                // className="z-20 mt-3 max-w-md py-4 bg-gray-900 hover:bg-gray-800 active:bg-black font-k2d-semibold transition-all duration-300 shadow-xl transform hover:scale-105 active:scale-95"
                className="z-20"
            >
                Mint Your Card
            </BaseButton>

            {/* 앱 연결 안내 (주소가 없을 때만) */}
            {/* {!address && (
                <div className="mt-4 z-20">
                    <p className="text-sm text-white/80 text-center mb-2">
                        💡 Connect your Base Wallet to mint your card
                    </p>
                </div>
            )} */}
        </div>
    );
}
