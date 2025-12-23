import BackButton from "@/components/buttons/BackButton";
import { BaseModal } from "@/components/modals/BaseModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useBaseCard } from "@/hooks/api/useBaseCard";
import { useMyBaseCard } from "@/hooks/api/useMyBaseCard";
import { useMyCollections } from "@/hooks/api/useMyCollections";
import { addCollection, deleteCollection } from "@/lib/api/collections";
import { BaseCard } from "@/lib/types/api";
import defaultProfileImage from "@/public/assets/default-profile.png";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import {
    IoDocumentTextOutline,
    IoGridOutline,
    IoSparklesOutline,
} from "react-icons/io5";
import { NoCardState } from "./NoCardState";
import ProfileCardContent from "./ProfileCardContent";
import QuestBanner from "./QuestBanner";

// =============================================================================
// Types
// =============================================================================

type Mode = "profile" | "viewer";

interface MyBaseCardProfileProps {
    mode?: Mode;
    cardId?: string; // For viewer mode - filter from collections
}

// =============================================================================
// Loading Component
// =============================================================================

const LoadingState = () => (
    <div className="flex-1 h-full flex items-center justify-center">
        <AiOutlineLoading
            size={40}
            className="animate-spin text-basecard-blue"
        />
    </div>
);

// =============================================================================
// Main Component
// =============================================================================

export default function MyBaseCardProfile({
    mode = "profile",
    cardId,
}: MyBaseCardProfileProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, accessToken } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<"earn" | "personal">("earn");
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [localCollected, setLocalCollected] = useState(false);

    // Mode flags (declared early for conditional hook usage)
    const isViewer = mode === "viewer";
    const isProfile = mode === "profile";

    // Data fetching based on mode
    const { data: myCard, isLoading: isMyCardLoading } = useMyBaseCard();
    const { data: viewerCard, isLoading: isViewerCardLoading } = useBaseCard(
        isViewer ? cardId : undefined
    );
    const { data: collections } = useMyCollections();

    // ==========================================================================
    // Derived States
    // ==========================================================================

    // Card data: from myCard (profile) or fetched viewerCard (viewer)
    const card: BaseCard | null = useMemo(() => {
        if (isProfile) return myCard ?? null;
        if (isViewer) return viewerCard ?? null;
        return null;
    }, [isProfile, isViewer, myCard, viewerCard]);

    // Owner profile image URL (for viewer mode - from farcasterProfile)
    const ownerPfpUrl = useMemo(() => {
        if (isViewer && viewerCard?.farcasterProfile) {
            return viewerCard.farcasterProfile.pfp_url;
        }
        // FID가 없거나 farcasterProfile이 null이면 기본 이미지 사용
        return defaultProfileImage.src;
    }, [isViewer, viewerCard]);

    const isLoading = isProfile ? isMyCardLoading : isViewerCardLoading;
    const isNotFound = !isLoading && !card;

    // Check if current card is already in collections (for viewer mode)
    const isCollectedFromQuery = useMemo(() => {
        if (!isViewer || !cardId || !collections) return false;
        return collections.some((c) => c.id === cardId);
    }, [isViewer, cardId, collections]);

    // Combined collected state (query result OR local state after successful collect)
    const isCollected = isCollectedFromQuery || localCollected;

    // ==========================================================================
    // Handlers
    // ==========================================================================

    const handleClose = () => router.back();
    const handleNavigateToCollection = () => router.push("/collection");

    const [isCollecting, setIsCollecting] = useState(false);
    const [isCollectSuccessModalOpen, setIsCollectSuccessModalOpen] =
        useState(false);
    const [isMintRequiredModalOpen, setIsMintRequiredModalOpen] =
        useState(false);

    const handleCollect = useCallback(async () => {
        if (!card?.id || isCollected) return;

        if (!isAuthenticated || !accessToken) {
            showToast("Please login to collect this card.", "error");
            return;
        }

        setIsCollecting(true);
        try {
            await addCollection(accessToken, card.id);
            setLocalCollected(true); // Immediately update UI
            queryClient.invalidateQueries({ queryKey: ["collectedCards"] }); // Refetch in background
            setIsCollectSuccessModalOpen(true); // Show success modal
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to collect card";
            if (message.includes("already exists")) {
                showToast("You have already collected this card.", "error");
                setLocalCollected(true); // Already collected
            } else if (
                message.includes("must have your own BaseCard") ||
                message.includes("before collecting")
            ) {
                // User doesn't have a basecard - show mint required modal
                setIsMintRequiredModalOpen(true);
            } else {
                showToast(message, "error");
            }
        } finally {
            setIsCollecting(false);
        }
    }, [
        card?.id,
        isAuthenticated,
        accessToken,
        showToast,
        queryClient,
        isCollected,
    ]);

    const handleRemove = useCallback(async () => {
        if (!card?.id) return;

        if (!isAuthenticated || !accessToken) {
            showToast("Please login to remove this card.", "error");
            return;
        }

        try {
            await deleteCollection(accessToken, card.id);
            setLocalCollected(false);
            queryClient.invalidateQueries({ queryKey: ["collectedCards"] });
            showToast("Removed from collection", "success");
            router.back();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to remove card";
            showToast(message, "error");
        }
    }, [
        card?.id,
        isAuthenticated,
        accessToken,
        showToast,
        queryClient,
        router,
    ]);

    // ==========================================================================
    // Styles
    // ==========================================================================

    const rootHeight = {
        minHeight: isViewer
            ? "calc(100dvh - var(--header-h, 60px))"
            : "calc(100dvh - var(--header-h, 60px) - var(--bottom-nav-h, 64px))",
    };

    // ==========================================================================
    // Render Functions
    // ==========================================================================

    const renderContent = () => {
        // Loading State
        if (isLoading) {
            return (
                <div
                    className="w-full flex flex-col items-center justify-center"
                    style={rootHeight}
                >
                    <LoadingState />
                </div>
            );
        }

        // Not Found State (profile mode - no card)
        if (isProfile && !card) {
            return (
                <div
                    className="w-full flex flex-col items-center justify-start overflow-y-auto relative px-4 py-6 pb-24 gap-6 bg-basecard-blue"
                    style={rootHeight}
                >
                    <NoCardState />
                </div>
            );
        }

        // Not Found State (viewer mode - card not in collections)
        if (isViewer && isNotFound) {
            return (
                <div
                    className="w-full flex flex-col items-center justify-center px-6 text-gray-500 font-k2d"
                    style={rootHeight}
                >
                    <p>해당 카드를 찾을 수 없습니다.</p>
                    <button
                        onClick={handleClose}
                        className="mt-4 text-basecard-blue underline"
                    >
                        돌아가기
                    </button>
                </div>
            );
        }

        // Main Content
        return (
            <div className="w-full flex flex-col items-center justify-start overflow-y-auto relative gap-y-3 pb-8">
                {/* [PROFILE ONLY] Quest Banner */}
                {isProfile && <QuestBanner />}

                {/* [VIEWER ONLY] Back Button */}
                {isViewer && (
                    <div className="w-full relative h-12 flex items-center justify-start">
                        <BackButton
                            size={40}
                            className="text-gray-600 relative m-0 left-0 top-0"
                        />
                    </div>
                )}

                {/* Card Section - Both modes */}
                <ProfileCardContent
                    card={card!}
                    mode={mode}
                    ownerPfpUrl={ownerPfpUrl ?? undefined}
                    onClose={isViewer ? handleClose : undefined}
                    isCollected={isViewer ? isCollected : undefined}
                    onCollect={isViewer ? handleCollect : undefined}
                    onRemove={isViewer ? handleRemove : undefined}
                />

                {/* [PROFILE ONLY] Action Buttons Row */}
                {isProfile && (
                    <div className="w-full flex justify-between gap-2 px-5">
                        <ActionButton
                            icon={<IoSparklesOutline size={24} />}
                            label="BaseName"
                            onClick={() => {}}
                            comingSoon
                        />
                        <ActionButton
                            icon={<IoDocumentTextOutline size={24} />}
                            label="Resume"
                            onClick={() => {}}
                            comingSoon
                        />
                        <ActionButton
                            icon={<IoGridOutline size={24} />}
                            label="Collection"
                            onClick={handleNavigateToCollection}
                        />
                    </div>
                )}

                {/* [PROFILE ONLY] Proof of Work Section */}
                {isProfile && (
                    <div className="w-full px-5">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-[24px] leading-tight font-semibold font-k2d text-black">
                                Proof of Work
                            </h3>
                            <button className="text-sm font-medium text-gray-400 hover:text-basecard-blue transition-colors">
                                + Add
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex w-full mb-4 relative border-b border-gray-200">
                            <TabButton
                                active={activeTab === "earn"}
                                onClick={() => setActiveTab("earn")}
                            >
                                Earn Project
                            </TabButton>
                            <TabButton
                                active={activeTab === "personal"}
                                onClick={() => setActiveTab("personal")}
                            >
                                Personal Project
                            </TabButton>
                        </div>

                        {/* Placeholder */}
                        <div className="w-full min-h-[200px] flex flex-col items-center justify-center pt-2">
                            <div className="w-[120px] h-[120px] opacity-20 relative mb-4">
                                <IoGridOutline
                                    size={120}
                                    className="text-gray-400"
                                />
                            </div>
                            <span className="text-gray-400 font-k2d text-sm">
                                Still coming
                            </span>
                        </div>
                    </div>
                )}

                {/* [PROFILE ONLY] TODO Modal */}
                {isProfile && (
                    <BaseModal
                        isOpen={isTodoModalOpen}
                        onClose={() => setIsTodoModalOpen(false)}
                        title="Coming Soon"
                        description="TODO please wait"
                        buttonText="Close"
                    />
                )}

                {/* [VIEWER ONLY] Collect Success Modal */}
                {isViewer && (
                    <BaseModal
                        isOpen={isCollectSuccessModalOpen}
                        onClose={() => setIsCollectSuccessModalOpen(false)}
                        title="🎉 Collected!"
                        description="This card has been added to your collection."
                        buttonText="Go to My Collection"
                        onButtonClick={() => {
                            setIsCollectSuccessModalOpen(false);
                            router.push("/collection");
                        }}
                    />
                )}

                {/* [VIEWER ONLY] Mint Required Modal */}
                {isViewer && (
                    <BaseModal
                        isOpen={isMintRequiredModalOpen}
                        onClose={() => {
                            setIsMintRequiredModalOpen(false);
                            router.push("/");
                        }}
                        title="Create Your BaseCard First"
                        description="You must have your own BaseCard before collecting others."
                        variant="error"
                        buttonText="Go to Home"
                        onButtonClick={() => {
                            setIsMintRequiredModalOpen(false);
                            router.push("/");
                        }}
                    />
                )}
            </div>
        );
    };

    return renderContent();
}

// =============================================================================
// Sub Components
// =============================================================================

function ActionButton({
    icon,
    label,
    onClick,
    comingSoon = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    comingSoon?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className="relative flex-1 h-20 bg-[#007AFF] rounded-lg flex flex-col items-center justify-center
                gap-1.5 text-white hover:bg-basecard-blue transition-colors shadow-md active:scale-95 overflow-hidden"
        >
            {icon}
            <span className="font-k2d font-medium text-[13px] leading-none">
                {label}
            </span>
            {comingSoon && (
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-lg"
                    style={{
                        background:
                            "linear-gradient(360deg, rgba(204,228,255,0.85) 0%, rgba(119,184,255,0.85) 100%)",
                    }}
                >
                    <span className="font-bold text-sm text-[#0050FF]">
                        Coming
                        <br />
                        Soon!
                    </span>
                </div>
            )}
        </button>
    );
}

function TabButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex-1 pb-2 text-[14px] font-k2d font-medium transition-all relative",
                active
                    ? "text-basecard-blue"
                    : "text-gray-400 hover:text-gray-600"
            )}
        >
            {children}
            {active && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-basecard-blue rounded-full" />
            )}
        </button>
    );
}
