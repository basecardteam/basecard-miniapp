import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface QuestItemProps {
    title: string;
    content: string;
    buttonName: string;
    point: string | number;
    className?: string;
    isCompleted?: boolean;
    isClaimable?: boolean;
    isClaiming?: boolean;
    onClaim?: () => void;
}

export default function QuestItem({
    title,
    content,
    buttonName,
    point,
    className,
    isCompleted = false,
    isClaimable = false,
    isClaiming = false,
    onClaim,
}: QuestItemProps) {
    const canClaim = !isCompleted && !isClaiming;

    return (
        <div
            className={cn(
                "flex flex-col items-start p-3 gap-3",
                "w-full bg-white border border-gray-200 rounded-lg",
                isCompleted && "opacity-50 bg-gray-50",
                className
            )}
        >
            {/* Header: Checkbox + Title & Description */}
            <div className="flex flex-row items-start gap-2 w-full">
                {/* Checkbox */}
                <div
                    className={cn(
                        "flex justify-center items-center w-5 h-5 rounded flex-shrink-0 mt-0.5",
                        isCompleted
                            ? "bg-green-500"
                            : isClaimable
                                ? "bg-yellow-500"
                                : "bg-gray-700"
                    )}
                >
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
                {/* Title + Description */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                        <span
                            className={cn(
                                "font-medium text-sm text-gray-900",
                                isCompleted && "line-through text-gray-500"
                            )}
                        >
                            {title}
                        </span>
                        {/* Claimable Badge */}
                        {isClaimable && !isCompleted && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                                Claim!
                            </span>
                        )}
                    </div>
                    {content && (
                        <span
                            className={cn(
                                "text-[11px] leading-tight text-gray-500 block mt-0.5",
                                isCompleted && "line-through"
                            )}
                        >
                            {content}
                        </span>
                    )}
                </div>
            </div>

            {/* Completed: Show earned points text */}
            {isCompleted ? (
                <div className="flex items-center justify-end w-full">
                    <span className="text-green-600 font-semibold text-sm">
                        +{point} BC
                    </span>
                </div>
            ) : (
                /* Button Group */
                <div className="flex flex-row items-center gap-2 w-full mt-0.5">
                    {/* Left Button (Action/Claim) */}
                    <button
                        onClick={canClaim ? onClaim : undefined}
                        disabled={isClaiming}
                        className={cn(
                            "flex-1 flex justify-center items-center h-8 px-2 rounded-md text-sm font-medium transition-colors",
                            isClaimable
                                ? "bg-yellow-400 text-gray-900 active:bg-yellow-500"
                                : "bg-white border border-gray-300 text-gray-700 active:bg-gray-50"
                        )}
                    >
                        {isClaiming ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <span>{buttonName}</span>
                        )}
                    </button>

                    {/* Right Button (Reward) */}
                    <button
                        onClick={isClaimable ? onClaim : undefined}
                        disabled={isClaiming || !isClaimable}
                        className={cn(
                            "flex-1 flex justify-center items-center h-8 px-2 rounded-md text-sm font-medium",
                            isClaimable
                                ? "bg-blue-600 text-white active:bg-blue-700"
                                : "bg-blue-600/70 text-white/80 cursor-not-allowed"
                        )}
                    >
                        <span>+ {point} BC</span>
                    </button>
                </div>
            )}
        </div>
    );
}
