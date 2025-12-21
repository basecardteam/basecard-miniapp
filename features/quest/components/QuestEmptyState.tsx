interface QuestEmptyStateProps {
    variant?: "light" | "dark";
}

export default function QuestEmptyState({ variant = "light" }: QuestEmptyStateProps) {
    if (variant === "dark") {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <p className="text-white/70 text-base font-medium">No quests available</p>
                <p className="text-white/50 text-sm">Check back later!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
            <p className="text-gray-500 text-base font-medium">No quests available</p>
            <p className="text-gray-400 text-sm">Check back later!</p>
        </div>
    );
}
