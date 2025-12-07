"use client";

import BaseCardLogoTypo from "@/public/baseCardTypo.png";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFrameContext } from "@/components/providers/FrameProvider";
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
        <div className="fixed top-0 z-50 flex-none w-full flex px-4 items-center justify-between border-b border-b-gray-200 bg-background-light h-[60px]">
            <div
                onClick={handleLogoClick}
                className="relative flex flex-shrink-0 h-10 cursor-pointer"
            >
                <Image
                    src={BaseCardLogoTypo}
                    alt="logo typo"
                    height={40}
                    className="object-contain"
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
