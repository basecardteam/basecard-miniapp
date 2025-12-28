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
    isVerifiable?: boolean;
    isClaiming?: boolean;
    isVerifying?: boolean;
    actionType?: string;
    onAction?: () => void;
}

export default function QuestItem({
    title,
    content,
    buttonName,
    point,
    className,
    isCompleted = false,
    isClaimable = false,
    isVerifiable = false,
    isClaiming = false,
    isVerifying = false,
    onAction,
}: QuestItemProps) {
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
                            ? "bg-blue-500"
                            : isClaimable
                            ? "bg-white border-2 border-blue-500"
                            : "border-2 border-gray-300 bg-white"
                    )}
                >
                    <Check
                        className={cn(
                            "w-3 h-3 stroke-[3]",
                            isCompleted
                                ? "text-white"
                                : isClaimable
                                ? "text-blue-500"
                                : "text-gray-300"
                        )}
                    />
                </div>
                {/* Title + Description */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                        <span
                            className={cn(
                                "font-regular text-base text-gray-900",
                                isCompleted && "line-through text-gray-500"
                            )}
                        >
                            {title}
                        </span>
                        {/* Claimable Badge */}
                        {isClaimable && !isCompleted && (
                            <span className="text-[10px] bg-white border border-blue-500 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                Claim!
                            </span>
                        )}
                    </div>
                    {content && (
                        <span
                            className={cn(
                                "text-sm leading-tight text-gray-500 block mt-0.5",
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
                <div className="flex items-center justify-end w-full h-10">
                    <span className="text-green-600 font-semibold text-sm">
                        +{point} BC
                    </span>
                </div>
            ) : isClaimable ? (
                /* Claimable: Single big claim button */
                <button
                    onClick={() => {
                        onAction?.();
                    }}
                    disabled={isClaiming}
                    className={cn(
                        "w-full flex justify-center items-center h-9 rounded-md",
                        "text-sm font-semibold text-white active:opacity-90",
                        "transition-colors animate-claimable-gradient"
                    )}
                >
                    {isClaiming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <span>Claim +{point} BC</span>
                    )}
                </button>
            ) : (
                /* Pending: Action button + disabled reward */
                <div className="flex flex-row items-center gap-2 w-full mt-0.5">
                    <button
                        type="button"
                        onClick={() => {
                            onAction?.();
                        }}
                        disabled={isVerifying}
                        className={cn(
                            "flex-1 flex justify-center items-center h-10 px-2 rounded-md text-sm font-medium transition-colors",
                            isVerifying
                                ? "bg-blue-50 border border-blue-200 text-blue-500"
                                : isVerifiable
                                ? "bg-blue-500 text-white active:bg-blue-600"
                                : "bg-white border border-gray-300 text-gray-700 active:bg-gray-50"
                        )}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <span>{buttonName}</span>
                        )}
                    </button>
                    <div
                        className={cn(
                            "flex-1 h-10 flex justify-center items-center px-2 rounded-md text-sm font-medium",
                            isVerifiable
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                        )}
                    >
                        <span>+{point} BC</span>
                    </div>
                </div>
            )}
        </div>
    );
}
