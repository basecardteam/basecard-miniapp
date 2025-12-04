import QuestCardImage from "@/components/quest/QuestCardImage";
import BaseButton from "@/components/ui/BaseButton";
import QuestItem from "@/components/quest/QuestItem";
import { cn } from "@/lib/utils";

export default function QuestPage() {
    // Example data for quests
    const quests = [
        {
            id: 1,
            title: "Daily Login",
            content: "Log in to the app every day to earn points.",
            buttonName: "Claim",
            point: 10,
        },
        {
            id: 2,
            title: "Mint Base Card",
            content: "Mint your first Base Card to unlock exclusive rewards.",
            buttonName: "Go Mint",
            point: 50,
        },
        {
            id: 3,
            title: "Share Profile",
            content: "Share your profile with friends on social media.",
            buttonName: "Share",
            point: 20,
        },
    ];

    return (
        <div className="relative w-full min-h-full flex flex-col items-center overflow-y-auto pb-20 bg-[#0050ff]">
            {/* Content Container */}
            <div className="w-full flex flex-col items-center pt-10 px-6">
                {/* Title */}
                <h1 className="font-k2d text-3xl font-bold text-white text-center mb-8 leading-tight whitespace-nowrap">
                    Your first onchain ID card
                </h1>

                {/* Central Card Image */}
                <div className="mb-8">
                    <QuestCardImage />
                </div>

                {/* Process List */}
                <div className="w-full max-w-[340px] flex flex-col gap-4 mb-8 px-0 font-k2d">
                    <div className="flex items-center gap-3 text-white text-lg font-medium">
                        <span className="flex-shrink-0">1.</span>
                        <span>Mint your BaseCard</span>
                    </div>
                    <div className="flex items-center gap-3 text-white text-lg font-medium">
                        <span className="flex-shrink-0">2.</span>
                        <span>Earn BC</span>
                    </div>
                    <div className="flex items-center gap-3 text-white text-lg font-medium">
                        <span className="flex-shrink-0">3.</span>
                        <span>Use your BC points to earn USDC</span>
                    </div>
                </div>

                {/* Mint Button */}
                <BaseButton className="max-w-[302px] h-[45px] rounded-[8px] font-bold gap-[8.71px] mb-12">
                    Mint your BaseCard
                </BaseButton>

                {/* Quest List (Existing) */}
                <div className="flex flex-col gap-4 w-full max-w-[340px] items-center">
                    {quests.map((quest) => (
                        <QuestItem
                            key={quest.id}
                            title={quest.title}
                            content={quest.content}
                            buttonName={quest.buttonName}
                            point={quest.point}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
