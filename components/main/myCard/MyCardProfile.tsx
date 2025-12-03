"use client";

import { useBaseCardSocials } from "@/hooks/card/useBaseCardDetail";
import { walletAddressAtom } from "@/store/walletState";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { AiOutlineLoading } from "react-icons/ai";

import CardContent from "./CardContent";
import { NoCardState } from "./NoCardState";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";

const LoadingState = () => (
    <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF]">
        <AiOutlineLoading
            width={40}
            height={40}
            className="animate-spin text-white"
        />
    </div>
);

interface MyCardProfileProps {
    title?: string;
}

export default function MyCardProfile({ title }: MyCardProfileProps) {
    const router = useRouter();
    const openUrl = useOpenUrl();
    const [walletAddress] = useAtom(walletAddressAtom);

    const { data: cardData, isPending, error } = useMyBaseCard(walletAddress);
    const { socials, isLoading: isSocialLoading } = useBaseCardSocials(
        cardData?.tokenId ?? null,
        {
            keys: ["x", "farcaster", "github", "linkedin", "website"],
            enabled: cardData?.tokenId !== undefined,
        }
    );

    const handleNavigateToCollection = () => {
        router.push("/collection");
    };

    const handleNavigateToMint = () => {
        router.push("/mint");
    };

    const rootHeight = {
        minHeight:
            "calc(100dvh - var(--header-h, 60px) - var(--bottom-nav-h, 64px))",
    };

    return (
        <div
            className="w-full flex flex-col overflow-hidden relative"
            style={rootHeight}
        >
            {isPending && <LoadingState />}

            {!isPending && (error || !cardData) && (
                <NoCardState onNavigateToMint={handleNavigateToMint} />
            )}

            {!isPending && cardData && (
                <CardContent
                    card={cardData}
                    openUrl={openUrl}
                    socials={socials}
                    isSocialLoading={isSocialLoading}
                    mode="profile"
                    title={title}
                    onNavigateToCollection={handleNavigateToCollection}
                />
            )}
        </div>
    );
}
