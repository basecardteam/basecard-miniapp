import { BaseModal } from "@/components/modals/BaseModal";
import QuestBottomSheet from "@/components/modals/QuestBottomSheet";
import SuccessModal from "@/components/modals/SuccessModal";
import { useQuestHandler } from "@/features/quest/hooks/useQuestHandler";
import { useMyBaseCard } from "@/hooks/api/useMyBaseCard";
import { useQuests } from "@/hooks/api/useQuests";
import { useERC721Token } from "@/hooks/evm/useERC721Token";
import { Quest } from "@/lib/types/api";
import clsx from "clsx";
import { ChevronRight, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import {
    IoDocumentTextOutline,
    IoGridOutline,
    IoSparklesOutline,
} from "react-icons/io5";
import { NoCardState } from "./NoCardState";
import ProfileCardContent from "./ProfileCardContent";

const LoadingState = () => (
    <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF]">
        <AiOutlineLoading
            width={40}
            height={40}
            className="animate-spin text-white"
        />
    </div>
);

export default function MyBaseCardProfile() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"earn" | "personal">("earn");
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [isQuestSheetOpen, setIsQuestSheetOpen] = useState(false);

    // Use shared quest handler
    const { handleQuestAction, successModalState, setSuccessModalState } =
        useQuestHandler();

    const { data: cardData, isLoading: isPending } = useMyBaseCard();

    // Use useERC721Token for on-chain data including socials
    const { metadata, isLoading: isTokenLoading } = useERC721Token();

    // Quest data
    const { quests, claimingQuest } = useQuests();

    const incompleteCount = useMemo(() => {
        return quests.filter((q) => q.status !== "completed").length;
    }, [quests]);

    const claimableCount = useMemo(() => {
        return quests.filter((q) => q.status === "claimable").length;
    }, [quests]);

    const claimableAmount = useMemo(() => {
        return quests
            .filter((q) => q.status === "claimable")
            .reduce((sum, q) => sum + q.rewardAmount, 0);
    }, [quests]);

    const socials = useMemo(() => {
        if (!metadata?.socials) return {};
        return metadata.socials.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }, [metadata]);

    const isSocialLoading = isTokenLoading;

    const handleNavigateToCollection = () => {
        router.push("/collection");
    };

    const getButtonName = (quest: Quest) => {
        if (quest.status === "completed") return "Claimed";
        if (quest.status === "claimable") return "Claim!";

        // 친숙한 버튼 텍스트
        const buttonLabels: Record<string, string> = {
            MINT: "Mint",
            SHARE: "Share",
            FOLLOW: "Follow",
            NOTIFICATION: "Enable",
            LINK_BASENAME: "Link",
            LINK_FARCASTER: "Link",
            LINK_GITHUB: "Link",
            LINK_LINKEDIN: "Link",
            LINK_TWITTER: "Link",
            LINK_WEBSITE: "Link",
        };

        return buttonLabels[quest.actionType] || quest.actionType;
    };

    const rootHeight = {
        minHeight:
            "calc(100dvh - var(--header-h, 60px) - var(--bottom-nav-h, 64px))",
    };

    if (isPending) {
        return (
            <div
                className="w-full flex flex-col items-center justify-start overflow-y-auto relative px-4 py-6 gap-6 bg-basecard-blue"
                style={rootHeight}
            >
                <LoadingState />
            </div>
        );
    }

    if (!cardData) {
        return (
            <div
                className="w-full flex flex-col items-center justify-start overflow-y-auto relative px-4 py-6 pb-24 gap-6 bg-basecard-blue"
                style={rootHeight}
            >
                <NoCardState />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-start overflow-y-auto relative gap-y-3 pb-8">
            {/* Quest Banner */}
            {quests.length > 0 && (
                <div className="w-full px-4 pt-2">
                    <button
                        onClick={() => setIsQuestSheetOpen(true)}
                        className={clsx(
                            "w-full flex items-center justify-between px-3 py-1.5 rounded-lg",
                            "active:scale-[0.98] transition-transform",
                            claimableCount > 0
                                ? "bg-[#007AFF] text-white"
                                : "bg-[#007AFF]/10 border border-[#007AFF]/20"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Gift
                                className={clsx(
                                    "w-4 h-4",
                                    claimableCount > 0
                                        ? "text-white"
                                        : "text-[#007AFF]"
                                )}
                            />
                            <span
                                className={clsx(
                                    "font-semibold text-xs font-k2d",
                                    claimableCount > 0
                                        ? "text-white"
                                        : "text-[#007AFF]"
                                )}
                            >
                                {claimableCount > 0
                                    ? `Claim +${claimableAmount} BC`
                                    : `${incompleteCount} Quest${
                                          incompleteCount > 1 ? "s" : ""
                                      }`}
                            </span>
                        </div>
                        <ChevronRight
                            className={clsx(
                                "w-3.5 h-3.5",
                                claimableCount > 0
                                    ? "text-white"
                                    : "text-[#007AFF]"
                            )}
                        />
                    </button>
                </div>
            )}

            {/* Card Section */}
            <ProfileCardContent
                card={cardData}
                socials={socials}
                isSocialLoading={isSocialLoading}
            />

            {/* Action Buttons Row */}
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

            {/* Proof of Work Section */}
            <div className="w-full px-5">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[24px] leading-tight font-semibold font-k2d text-black">
                        Proof of Work
                    </h3>
                    <div className="flex flex-col items-end">
                        <button className="text-sm font-medium text-gray-400 hover:text-basecard-blue transition-colors">
                            + Add
                        </button>
                    </div>
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

                {/* Content Area - Placeholder */}
                <div className="w-full min-h-[200px] flex flex-col items-center justify-center pt-2">
                    {/* Placeholder icon and text */}
                    <div className="w-[120px] h-[120px] opacity-20 relative mb-4">
                        <IoGridOutline size={120} className="text-gray-400" />
                    </div>
                    <span className="text-gray-400 font-k2d text-sm">
                        Still coming
                    </span>
                </div>
            </div>

            {/* TODO Modal */}
            <BaseModal
                isOpen={isTodoModalOpen}
                onClose={() => setIsTodoModalOpen(false)}
                title="Coming Soon"
                description="TODO please wait"
                buttonText="Close"
            />

            {/* Quest Success Modal */}
            <SuccessModal
                isOpen={successModalState.isOpen}
                onClose={() =>
                    setSuccessModalState((prev) => ({ ...prev, isOpen: false }))
                }
                title="Quest Claimed!"
                description={`You earned +${successModalState.rewarded} BC.\nTotal Balance: ${successModalState.newTotalPoints} BC`}
                buttonText="Awesome!"
            />

            {/* Quest Bottom Sheet */}
            <QuestBottomSheet
                isOpen={isQuestSheetOpen}
                onClose={() => setIsQuestSheetOpen(false)}
                quests={quests}
                claimingQuest={claimingQuest}
                onAction={handleQuestAction}
                getButtonName={getButtonName}
            />
        </div>
    );
}

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
