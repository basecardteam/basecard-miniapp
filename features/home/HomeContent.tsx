"use client";

import { useToast } from "@/components/ui/Toast";
import { useMyBaseCard } from "@/hooks/api/useMyBaseCard";
import { useUser } from "@/hooks/api/useUser";
import { useMiniappParams } from "@/hooks/useMiniappParams";
import { ACTION_ADD_CARD } from "@/lib/constants/actions";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import CardCollectionAdder from "./components/CardCollectionAdder";
import CollectCardsSection from "./components/CollectCardsSection";
import HeroSection from "./components/HeroSection";
import HomeSkeleton from "./components/HomeSkeleton";
import MyCardSection from "./components/MyCardSection";


export default function HomeContent() {
    const router = useRouter();
    const { address } = useAccount();
    const { data: _, isPending: isUserPending } = useUser();
    const { data: card, isPending: isCardPending } = useMyBaseCard();
    const { action, cardId } = useMiniappParams();
    const { showToast } = useToast();

    const handleMintRedirect = () => {
        if (!address) {
            showToast("Please connect your wallet first", "warning");
            return;
        }
        router.push("/mint");
    };

    if (address && (isUserPending || isCardPending)) {
        return <HomeSkeleton />;
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
