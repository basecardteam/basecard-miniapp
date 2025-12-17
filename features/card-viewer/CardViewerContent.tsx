"use client";

import MyBaseCardScreen from "@/features/my-base-card/MyBaseCardScreen";

export default function CardViewerContent() {
    return (
        <div className="relative">
            <MyBaseCardScreen mode="viewer" />
        </div>
    );
}
