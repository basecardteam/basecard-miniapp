interface QuestItemSkeletonProps {
    variant?: "light" | "dark";
}

export default function QuestItemSkeleton({ variant = "light" }: QuestItemSkeletonProps) {
    if (variant === "dark") {
        return (
            <div className="flex flex-col p-3 gap-3 w-full bg-blue-400/30 border border-blue-300/20 rounded-lg animate-pulse">
                <div className="flex flex-row items-start gap-2 w-full">
                    <div className="w-5 h-5 rounded bg-blue-300/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="h-4 bg-blue-300/40 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-blue-300/30 rounded w-1/2" />
                    </div>
                </div>
                <div className="flex flex-row gap-2 w-full">
                    <div className="flex-1 h-10 bg-blue-300/40 rounded-md" />
                    <div className="flex-1 h-10 bg-blue-300/30 rounded-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-3 gap-3 w-full bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="flex flex-row items-start gap-2 w-full">
                <div className="w-5 h-5 rounded bg-gray-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            </div>
            <div className="flex flex-row gap-2 w-full">
                <div className="flex-1 h-10 bg-gray-200 rounded-md" />
                <div className="flex-1 h-10 bg-gray-100 rounded-md" />
            </div>
        </div>
    );
}
