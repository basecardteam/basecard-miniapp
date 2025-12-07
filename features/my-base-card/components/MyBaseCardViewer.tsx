"use client";

import { useRouter } from "next/navigation";

import { useBaseCardSocials } from "@/hooks/useBaseCardDetail";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { Card } from "@/lib/types";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";

import CardContent from "./CardContent";

interface MyCardViewerProps {
    card?: Card;
    address?: string;
    title?: string;
}

export default function MyBaseCardViewer({
    card: cardProp,
    address,
    title,
}: MyCardViewerProps) {
    const router = useRouter();
    const openUrl = useOpenUrl();
    const { data: fetchedCard, isLoading } = useMyBaseCard();

    const { socials, isLoading: isSocialLoading } = useBaseCardSocials(
        fetchedCard?.tokenId ?? null,
        {
            keys: ["x", "farcaster", "github", "linkedin", "website"],
            enabled: fetchedCard?.tokenId !== undefined,
        }
    );

    const rootHeight = {
        minHeight: "calc(100dvh - var(--header-h, 60px))",
    };

    if (isLoading) {
        return (
            <div
                className="w-full flex flex-col overflow-hidden relative"
                style={rootHeight}
            >
                <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    if (!fetchedCard) {
        return (
            <div
                className="w-full flex flex-col overflow-hidden relative"
                style={rootHeight}
            >
                <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF] px-6 py-8 text-white font-k2d-medium text-center">
                    해당 주소의 카드를 찾을 수 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full flex flex-col overflow-hidden relative"
            style={rootHeight}
        >
            <CardContent
                card={fetchedCard}
                openUrl={openUrl}
                socials={socials}
                isSocialLoading={isSocialLoading}
                mode="viewer"
                title={title}
                onClose={() => router.back()}
            />
        </div>
    );
}
