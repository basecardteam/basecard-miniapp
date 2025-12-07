"use client";

import { generateCardDataURL, generateMockCard } from "@/lib/cardGenerator";
import { useState, useEffect } from "react";

interface MintPromptSectionProps {
    onMintClick: () => void;
}

export default function MintPromptSection({
    onMintClick,
}: MintPromptSectionProps) {
    const [cardDataURL, setCardDataURL] = useState<string>("");

    useEffect(() => {
        // Generate a mock card for preview
        const mockProfile = generateMockCard();
        const dataURL = generateCardDataURL(mockProfile, {
            width: 300,
            height: 450,
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            accentColor: "#3b82f6",
        });
        setCardDataURL(dataURL);
    }, []);

    return (
        <div className="bg-white text-black flex flex-col justify-center items-center p-5">
            <h2 className="font-semibold text-3xl text-center mb-6">
                Onchain Social
                <br />
                Business Card
            </h2>
            <div className="w-full px-5 py-5">
                <div className="w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {cardDataURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={cardDataURL}
                            alt="BaseCard Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
                            <span className="text-gray-500">
                                Loading preview...
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={onMintClick}
                className="w-full py-3 bg-button-1 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
                Mint your Card
            </button>
        </div>
    );
}
