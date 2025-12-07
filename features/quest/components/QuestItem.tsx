import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestItemProps {
    title: string;
    content: string;
    buttonName: string;
    point: string | number;
    className?: string;
    onClick?: () => void;
}

export default function QuestItem({
    title,
    content,
    buttonName,
    point,
    className,
    onClick,
}: QuestItemProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-start p-[18px] gap-[18px]",
                "w-full bg-white border border-[#d9d9d9] rounded-[8px]",
                "relative",
                className
            )}
        >
            {/* Header: Checkbox and Title */}
            <div className="flex flex-row items-center gap-3 w-full">
                {/* Checkbox */}
                <div className="flex justify-center items-center w-[23px] h-[23px] bg-[#2C2C2C] rounded-[5.75px] flex-shrink-0">
                    <Check className="w-[14px] h-[14px] text-[#F5F5F5] stroke-[3]" />
                </div>
                {/* Title */}
                <span className="font-normal text-[16px] leading-[140%] text-[#1E1E1E]">
                    {title}
                </span>
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
                {/* Left Button (Action) */}
                <button
                    onClick={onClick}
                    className="flex-1 flex flex-row justify-center items-center h-[40px] px-3 gap-2 bg-white border border-black rounded-[8px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-gray-50 transition-colors"
                >
                    <span className="font-normal text-[16px] leading-none text-[#303030]">
                        {buttonName}
                    </span>
                </button>

                {/* Right Button (Reward) */}
                <button className="flex-1 flex flex-row justify-center items-center h-[40px] px-3 gap-2 bg-[#0050FF] rounded-[8px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-blue-700 transition-colors">
                    <span className="font-normal text-[16px] leading-none text-[#F5F5F5]">
                        + {point} BC
                    </span>
                </button>
            </div>
        </div>
    );
}
