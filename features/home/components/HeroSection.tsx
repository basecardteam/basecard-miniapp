"use client";

import BaseButton from "@/components/buttons/BaseButton";
import LandingBG from "@/public/assets/landing-page-backgrou.webp";
import LandingCard from "@/public/assets/landing-page-background-card.webp";
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
                <h1 className="text-3xl sm:text-4xl font-k2d font-bold text-white mb-2 drop-shadow-lg tracking-tight leading-tight">
                    Onchain social ID Card
                </h1>
                <p className="text-lg sm:text-2xl font-k2d font-medium text-white max-w-2xl drop-shadow-md tracking-normal">
                    Turn your onchain story into opportunity
                </p>
            </div>

            <div className="flex justify-center items-center">
                <Image
                    src={LandingCard}
                    height={220}
                    alt="landing-page-card"
                    priority
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="object-contain z-50 select-none pointer-events-none"
                    style={{ width: "auto", imageRendering:"auto", userSelect:'none', msUserSelect:'none', MozUserSelect:'none' }}
                />
            </div> 

            {/* Mint Button */}
            <BaseButton
                onClick={onMintClick}
                className="z-20 w-full"
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
