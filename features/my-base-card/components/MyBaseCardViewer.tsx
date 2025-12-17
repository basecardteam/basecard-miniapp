"use client";

import { useRouter } from "next/navigation";
import { useERC721Token } from "@/hooks/useERC721Token";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import CardContent from "./CardContent";
import { sdk } from "@farcaster/miniapp-sdk";
import { useMemo } from "react";

interface MyCardViewerProps {
    title?: string;
}

export default function MyBaseCardViewer({ title }: MyCardViewerProps) {
    const router = useRouter();
    const { data: fetchedCard, isLoading } = useMyBaseCard();

    // New Hook Usage
    const { metadata, isLoading: isTokenLoading } = useERC721Token();

    const socials = useMemo(() => {
        if (!metadata?.socials) return {};
        return metadata.socials.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }, [metadata]);

    const isSocialLoading = isTokenLoading;
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
                <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF] px-6 py-8 text-white font-k2d font-medium text-center">
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
                openUrl={sdk.actions.openUrl}
                socials={socials}
                isSocialLoading={isSocialLoading}
                mode="viewer"
                title={title}
                onClose={() => router.back()}
            />
        </div>
    );
}
