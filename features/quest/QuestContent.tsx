import QuestItem from "@/features/quest/components/QuestItem";
import QuestHeroSection from "@/features/quest/components/QuestHeroSection";
import { cn } from "@/lib/utils";

export default function QuestContent() {
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
        <div className="relative w-full min-h-full flex flex-col items-center overflow-y-auto overscroll-y-none pb-20 bg-[#0050ff]">
            {/* Content Container */}
            <div className="w-full flex flex-col items-center pt-10 px-6">
                {/* Hero Section */}
                <QuestHeroSection />

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
