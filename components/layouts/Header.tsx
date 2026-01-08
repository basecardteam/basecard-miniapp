"use client";

import { useFrameContext } from "@/components/providers/FrameProvider";
import BaseCardLogoTypo from "@/public/assets/basecard-typo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BrowserWalletConnect from "./BrowserWalletConnect";
import ConnectedUserDisplay from "./ConnectedUserDisplay";

export default function Header() {
    const router = useRouter();
    const frameContext = useFrameContext();
    const isInMiniApp = frameContext?.isInMiniApp ?? false;

    const handleLogoClick = () => {
        router.push("/");
    };

    return (
        <div
            className="fixed top-0 z-50 flex h-header w-full max-w-xl mx-auto px-4 items-center
                justify-between border-b border-b-gray-200 bg-basecard-white"
        >
            <div
                onClick={handleLogoClick}
                className="relative flex flex-shrink-0 h-10 cursor-pointer"
            >
                <Image
                    src={BaseCardLogoTypo}
                    alt="logo typo"
                    height={32}
                    className="object-contain py-auto my-auto"
                    priority
                />
            </div>
            <div className="ml-auto flex items-center gap-x-1 bg-white rounded-full">
                {!isInMiniApp ? (
                    <BrowserWalletConnect />
                ) : (
                    <ConnectedUserDisplay />
                )}
            </div>
        </div>
    );
}
