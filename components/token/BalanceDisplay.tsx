"use client";

import { cn, text as dsText } from "@coinbase/onchainkit/theme";
import { AiOutlineLoading } from "react-icons/ai";
import { useUser } from "@/hooks/useUser";

interface BalanceDisplayProps {
    className?: string;
}

export default function BalanceDisplay({ className }: BalanceDisplayProps) {
    const { data: user, isPending } = useUser();
    return (
        <div
            className={`text-ock-foreground relative flex w-full items-center justify-between ${className} `}
        >
            <div className="flex items-center gap-x-1">
                {isPending ? (
                    <AiOutlineLoading size={14} className="animate-spin" />
                ) : (
                    <span className={cn(dsText.body, "font-k2d-bold")}>
                        {user?.totalPoints?.toLocaleString() ?? 0} Point
                    </span>
                )}
            </div>
        </div>
    );
}
