"use client";

import MyBaseCardProfile from "./components/BaseCardProfile";

export interface MyBaseCardScreenProps {
    mode?: "viewer" | "profile";
    cardId?: string; // For collection viewer mode
}

export default function MyBaseCardScreen({
    mode = "profile",
    cardId,
}: MyBaseCardScreenProps = {}) {
    return <MyBaseCardProfile mode={mode} cardId={cardId} />;
}

export { MyBaseCardProfile };
