"use client";

import MyBaseCardScreen from "@/features/my-base-card/MyBaseCardScreen";

interface CardViewerScreenProps {
    address: string;
}

export default function CardViewerContent({ address }: CardViewerScreenProps) {
    return (
        <div className="relative">
            <MyBaseCardScreen mode="viewer" title="" />
        </div>
    );
}
