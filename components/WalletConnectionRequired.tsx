"use client";

import { AppConnectionRequired } from "@/components/feedback/AppConnectionRequired";
import BackButton from "@/components/buttons/BackButton";

interface WalletConnectionRequiredProps {
    title?: string;
    description?: string;
}

export const WalletConnectionRequired = ({
    title = "Wallet Connection Required",
    description = "Please connect your Base Wallet to use this feature.",
}: WalletConnectionRequiredProps) => {
    return (
        <div className="bg-white text-basecard-black w-full h-full min-h-[50vh]">
            <div className="relative">
                <BackButton />
            </div>
            <AppConnectionRequired title={title} description={description} />
        </div>
    );
};
