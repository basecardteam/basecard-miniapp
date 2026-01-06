"use client";

import { useUser } from "@/hooks/api/useUser";
import { cn, text as dsText } from "@coinbase/onchainkit/theme";

interface BalanceDisplayProps {
    className?: string;
}

export default function BalanceDisplay({ className }: BalanceDisplayProps) {
    const { user, isPending } = useUser();
    return (
        <div
            className={`text-ock-foreground relative flex w-full items-center justify-between ${className} `}
        >
            <div className="flex items-center gap-x-1">
                {isPending ? (
                    "0 Point"
                ) : (
                    <span className={cn(dsText.body, "font-k2d font-bold")}>
                        {user?.totalPoints?.toLocaleString() ?? 0} Point
                    </span>
                )}
            </div>
        </div>
    );
}
