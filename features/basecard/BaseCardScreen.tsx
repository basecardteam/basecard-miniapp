"use client";

import BaseCardProfile from "./components/BaseCardProfile";

export interface BaseCardScreenProps {
    mode?: "viewer" | "profile";
    cardId?: string; // For collection viewer mode
}

export default function BaseCardScreen({
    mode = "profile",
    cardId,
}: BaseCardScreenProps = {}) {
    return <BaseCardProfile mode={mode} cardId={cardId} />;
}

export { BaseCardScreen };
