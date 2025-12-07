"use client";

import { ROOT_URL } from "@/minikit.config";
import baseCardTypo from "@/public/baseCardTypo.png";
import Image from "next/image";
import { useMemo } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useIsMobile } from "@/hooks/useIsMobile";

const IOS_STORE_URL =
    "https://apps.apple.com/kr/app/coinbase-%EC%A7%80%EA%B0%91-nfts-%EC%95%94%ED%98%B8%ED%99%94%ED%8F%90/id1278383455";
const ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=org.toshi&pcampaignid=web_share";

interface AppConnectionRequiredProps {
    title?: string;
    description?: string;
}

/**
 * 앱 연결이 필요한 경우 표시하는 컴포넌트
 */
export function AppConnectionRequired({
    title = "Base Wallet App Required",
    description = "This feature requires the Base Wallet app. Please connect your wallet to continue.",
}: AppConnectionRequiredProps) {
    const { isMobile, isIOS } = useIsMobile();

    const { deepLinkUrl, appStoreLink, buttonText } = useMemo(() => {
        const queryString =
            typeof window !== "undefined" ? window.location.search : "";
        const targetUrl = `${ROOT_URL}${queryString}`;
        const deepLink = `cbwallet://miniapp?url=${encodeURIComponent(
            targetUrl
        )}`;

        let storeLink = ANDROID_STORE_URL;
        let btnText = "Download on Google Play";

        if (isIOS) {
            storeLink = IOS_STORE_URL;
            btnText = "Download on the App Store";
        } else if (!isMobile) {
            storeLink = IOS_STORE_URL;
            btnText = "Download Base Wallet App";
        }

        return {
            deepLinkUrl: deepLink,
            appStoreLink: storeLink,
            buttonText: btnText,
        };
    }, [isIOS, isMobile]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-200">
                <div className="flex justify-center mb-6">
                    <Image
                        src={baseCardTypo}
                        alt="bc-logo"
                        height={60}
                        className="object-contain"
                    />
                </div>

                <h2 className="text-xl sm:text-2xl font-k2d-bold text-gray-800 mb-3">
                    {title}
                </h2>

                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    {description}
                </p>

                <div className="flex flex-col gap-3">
                    {isMobile ? (
                        <a
                            href={deepLinkUrl}
                            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white font-k2d-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors space-x-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>Open in Base Wallet App</span>
                            <FaArrowRight className="w-4 h-4" />
                        </a>
                    ) : (
                        <a
                            href={appStoreLink}
                            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white font-k2d-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors space-x-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>{buttonText}</span>
                            <FaArrowRight className="w-4 h-4" />
                        </a>
                    )}

                    {!isMobile && (
                        <div className="mt-2 text-sm text-gray-500 space-x-4">
                            <a
                                href={IOS_STORE_URL}
                                target="_blank"
                                className="hover:text-blue-600 underline"
                            >
                                iOS Download
                            </a>
                            <span>|</span>
                            <a
                                href={ANDROID_STORE_URL}
                                target="_blank"
                                className="hover:text-blue-600 underline"
                            >
                                Android Download
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
