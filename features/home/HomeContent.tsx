"use client";

import { ACTION_ADD_CARD } from "@/lib/constants/actions";
import { useMiniappParams } from "@/hooks/useMiniappParams";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { useUser } from "@/hooks/useUser";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import CardCollectionAdder from "./components/CardCollectionAdder";
import CollectCardsSection from "./components/CollectCardsSection";
import HeroSection from "./components/HeroSection";
import MyCardSection from "./components/MyCardSection";

const MainSkeleton = () => (
    <div className="flex flex-col w-full gap-4 px-5">
        {/* 1. Title Skeleton */}
        <div className="flex flex-col mt-5 gap-2">
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>

        {/* 2. Card Image Skeleton (가장 큰 영역) */}
        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>

        <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />

        {/* 3. Buttons Section Skeleton */}
        <div className="w-full flex gap-x-3">
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>

        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>
    </div>
);

export default function HomeContent() {
    const router = useRouter();
    const { address } = useAccount();
    const { data: userData, isPending: isUserPending } = useUser();
    const { data: card, isPending: isCardPending } = useMyBaseCard();
    const { action, cardId } = useMiniappParams();

    const handleMintRedirect = () => {
        router.push("/mint");
    };

    if (address && (isUserPending || isCardPending)) {
        return <MainSkeleton />;
    }

    return (
        <div className="bg-white">
            {card ? (
                <div className="flex flex-col flex-1">
                    {action === ACTION_ADD_CARD && cardId && (
                        <CardCollectionAdder collectedCardId={cardId} />
                    )}
                    <MyCardSection />
                    <div className="h-4 bg-gray-200" />
                    <CollectCardsSection />
                </div>
            ) : (
                <div className="flex flex-col flex-1">
                    <HeroSection onMintClick={handleMintRedirect} />
                    <CollectCardsSection />
                </div>
            )}
        </div>
    );
}
