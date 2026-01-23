"use client";

import { AppConnectionRequired } from "@/components/feedback/AppConnectionRequired";
import BackButton from "@/components/buttons/BackButton";
import { useState, useEffect } from "react";

interface WalletConnectionRequiredProps {
    title?: string;
    description?: string;
    delay?: number; // Delay in ms before showing the component
}

export const WalletConnectionRequired = ({
    title = "Wallet Connection Required",
    description = "Please connect your Base Wallet to use this feature.",
    delay = 1000, // Default 1 second delay
}: WalletConnectionRequiredProps) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    // Show nothing during delay period (allows context to load)
    if (!showContent) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                {/* Optional: loading spinner can be added here */}
            </div>
        );
    }

    return (
        <div className="bg-white text-basecard-black w-full h-full min-h-[50vh]">
            <div className="relative">
                <BackButton />
            </div>
            <AppConnectionRequired title={title} description={description} />
        </div>
    );
};
