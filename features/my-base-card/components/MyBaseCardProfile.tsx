import { useState, useMemo } from "react";
import { useERC721Token } from "@/hooks/useERC721Token";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { AiOutlineLoading } from "react-icons/ai";
import {
    IoSparklesOutline,
    IoDocumentTextOutline,
    IoGridOutline,
} from "react-icons/io5";
import ProfileCardContent from "./ProfileCardContent";
import { NoCardState } from "./NoCardState";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import clsx from "clsx";
import { BaseModal } from "@/components/modals/BaseModal";

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

export default function MyBaseCardProfile({ title }: MyCardProfileProps) {
    const router = useRouter();
    const openUrl = useOpenUrl();
    const [activeTab, setActiveTab] = useState<"earn" | "personal">("earn");
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

    const { data: cardData, isLoading: isPending, error } = useMyBaseCard();

    // Use useERC721Token for on-chain data including socials
    const { metadata, isLoading: isTokenLoading } = useERC721Token();

    const socials = useMemo(() => {
        if (!metadata?.socials) return {};
        return metadata.socials.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }, [metadata]);

    const isSocialLoading = isTokenLoading;

    const handleNavigateToCollection = () => {
        router.push("/edit-profile");
    };

    const handleNavigateToMint = () => {
        router.push("/mint");
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
                <NoCardState onNavigateToMint={handleNavigateToMint} />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-start overflow-y-auto relative py-2 gap-6">
            {/* Card Section */}
            <ProfileCardContent
                card={cardData}
                openUrl={openUrl}
                socials={socials}
                isSocialLoading={isSocialLoading}
                onNavigateToCollection={handleNavigateToCollection}
                title={title}
            />

            {/* Action Buttons Row */}
            <div className="w-full max-w-[360px] flex justify-between gap-2">
                <ActionButton
                    icon={<IoSparklesOutline size={24} />}
                    label="BaseName"
                    onClick={() => setIsTodoModalOpen(true)}
                />
                <ActionButton
                    icon={<IoDocumentTextOutline size={22} />}
                    label="Resume"
                    onClick={() => setIsTodoModalOpen(true)}
                />
                <ActionButton
                    icon={<IoGridOutline size={22} />}
                    label="Collection"
                    onClick={handleNavigateToCollection}
                />
            </div>

            {/* Proof of Work Section */}
            <div className="w-full max-w-[360px]">
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
        </div>
    );
}

function ActionButton({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex-1 h-[80px] bg-basecard-blue rounded-[14px] flex flex-col items-center justify-center gap-1.5 text-white hover:bg-basecard-blue/90 transition-colors shadow-md active:scale-95"
        >
            {icon}
            <span className="font-k2d font-medium text-[13px] leading-none">
                {label}
            </span>
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
