"use client";

import { SocialsVerificationModal } from "@/components/modals/SocialsVerificationModal";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/hooks/api/useUser";
import { useMiniappParams } from "@/hooks/useMiniappParams";
import { ACTION_ADD_CARD } from "@/lib/constants/actions";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import CardCollectionAdder from "./components/CardCollectionAdder";
import CollectCardsSection from "./components/CollectCardsSection";
import HeroSection from "./components/HeroSection";
import HomeSkeleton from "./components/HomeSkeleton";
import MyCardSection from "./components/MyCardSection";

const LOADING_TIMEOUT_MS = 3000; // 3 seconds

export default function HomeScreen() {
    const router = useRouter();
    const { address } = useAccount();
    const { card, isPending } = useUser();
    const { action, cardId } = useMiniappParams();
    const { showToast } = useToast();

    // Timeout state - 3초 후 스켈레톤 대신 no-card UI 표시
    const [hasTimedOut, setHasTimedOut] = useState(false);

    // Verification modal state
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Check for unverified socials
    const hasUnverifiedSocials = useMemo(() => {
        if (!card?.socials) return false;
        return Object.values(card.socials).some(
            (entry) => entry && entry.handle && !entry.verified,
        );
    }, [card?.socials]);

    useEffect(() => {
        if (!isPending) {
            // 로딩 완료되면 타임아웃 리셋
            setHasTimedOut(false);
            return;
        }

        // 3초 후 타임아웃 설정
        const timer = setTimeout(() => {
            setHasTimedOut(true);
        }, LOADING_TIMEOUT_MS);

        return () => clearTimeout(timer);
    }, [isPending]);

    // Show verification modal if user has unverified socials
    useEffect(() => {
        if (!isPending && card && hasUnverifiedSocials) {
            setShowVerificationModal(true);
        }
    }, [isPending, card, hasUnverifiedSocials]);

    const handleMintRedirect = () => {
        if (!address) {
            showToast("Please connect your wallet first", "warning");
            return;
        }
        router.push("/mint");
    };

    const handleCloseVerificationModal = useCallback(() => {
        setShowVerificationModal(false);
    }, []);

    // 로딩 중이고 아직 타임아웃 안됐으면 스켈레톤 표시
    if (isPending && !hasTimedOut) {
        return <HomeSkeleton />;
    }

    // 카드 유무 결정 (로딩 완료 후 또는 타임아웃 후)
    const hasCard = !!card;

    return (
        <div className="bg-white">
            {hasCard ? (
                <div className="flex flex-col flex-1">
                    {action === ACTION_ADD_CARD && cardId !== null && (
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

            {/* Socials Verification Modal */}
            <SocialsVerificationModal
                isOpen={showVerificationModal}
                onClose={handleCloseVerificationModal}
                socials={card?.socials}
            />
        </div>
    );
}
