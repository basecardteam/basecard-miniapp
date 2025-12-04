import { cn } from "@/lib/utils";
import React from "react";

interface BaseButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export default function BaseButton({
    children,
    className,
    ...props
}: BaseButtonProps) {
    return (
        <button
            className={cn(
                "w-full py-4 font-k2d-semibold text-lg rounded-xl transition-all duration-300 shadow-xl flex justify-center items-center",
                "transform hover:scale-105 active:scale-95",
                "bg-gray-900 text-white hover:bg-gray-800 active:bg-black",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
