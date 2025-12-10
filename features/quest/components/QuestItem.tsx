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
                "flex flex-col items-start p-[18px] gap-[18px]",
                "w-full bg-white border border-[#d9d9d9] rounded-[8px]",
                "relative",
                isCompleted && "opacity-70",
                className
            )}
        >
            {/* Header: Checkbox and Title */}
            <div className="flex flex-row items-center gap-3 w-full">
                {/* Checkbox */}
                <div
                    className={cn(
                        "flex justify-center items-center w-[23px] h-[23px] rounded-[5.75px] flex-shrink-0",
                        isCompleted
                            ? "bg-green-500"
                            : isClaimable
                            ? "bg-yellow-500"
                            : "bg-[#2C2C2C]"
                    )}
                >
                    <Check className="w-[14px] h-[14px] text-[#F5F5F5] stroke-[3]" />
                </div>
                {/* Title */}
                <span
                    className={cn(
                        "font-normal text-[16px] leading-[140%] text-[#1E1E1E]",
                        isCompleted && "line-through"
                    )}
                >
                    {title}
                </span>
                {/* Claimable Badge */}
                {isClaimable && !isCompleted && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Claimable!
                    </span>
                )}
            </div>

            {/* Description */}
            <div className="flex flex-row items-center gap-3 w-full">
                <div className="w-[23px] h-[23px] flex-shrink-0" />{" "}
                {/* Spacer to align with text */}
                <span className="font-normal text-[11px] leading-[140%] text-[#757575]">
                    {content}
                </span>
            </div>

            {/* Button Group */}
            <div className="flex flex-row items-center gap-[9px] w-full mt-auto">
                {/* Left Button (Action/Claim) */}
                <button
                    onClick={canClaim ? onClaim : undefined}
                    disabled={isCompleted || isClaiming}
                    className={cn(
                        "flex-1 flex flex-row justify-center items-center h-[40px] px-3 gap-2 rounded-[8px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-colors",
                        isCompleted
                            ? "bg-gray-200 border border-gray-300 cursor-not-allowed"
                            : isClaimable
                            ? "bg-yellow-400 border border-yellow-500 hover:bg-yellow-500 cursor-pointer"
                            : "bg-white border border-black cursor-pointer hover:bg-gray-50"
                    )}
                >
                    {isClaiming ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#303030]" />
                    ) : (
                        <span className="font-normal text-[16px] leading-none text-[#303030]">
                            {buttonName}
                        </span>
                    )}
                </button>

                {/* Right Button (Reward) */}
                <button
                    onClick={isClaimable ? onClaim : undefined}
                    disabled={isCompleted || isClaiming || !isClaimable}
                    className={cn(
                        "flex-1 flex flex-row justify-center items-center h-[40px] px-3 gap-2 rounded-[8px] shadow-[0_4px_4px_rgba(0,0,0,0.25)]",
                        isCompleted
                            ? "bg-green-500 cursor-default"
                            : isClaimable
                            ? "bg-[#0050FF] hover:bg-blue-700 transition-colors cursor-pointer"
                            : "bg-[#0050FF] opacity-70 cursor-not-allowed"
                    )}
                >
                    <span className="font-normal text-[16px] leading-none text-[#F5F5F5]">
                        {isCompleted ? "✓ " : "+ "}
                        {point} BC
                    </span>
                </button>
            </div>
        </div>
    );
}
