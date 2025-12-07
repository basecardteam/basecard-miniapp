"use client";

import MyBaseCardScreen from "@/features/my-base-card/MyBaseCardScreen";

interface CardViewerScreenProps {
    address: string;
}

export default function CardViewerScreen({ address }: CardViewerScreenProps) {
    return (
        <div className="relative">
            <MyBaseCardScreen address={address} mode="viewer" title="" />
        </div>
    );
}
