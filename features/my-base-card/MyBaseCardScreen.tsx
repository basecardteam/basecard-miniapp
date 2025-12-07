"use client";

import { Card } from "@/lib/types";

import MyBaseCardProfile from "./components/MyBaseCardProfile";
import MyBaseCardViewer from "./components/MyBaseCardViewer";

interface MyBaseCardScreenProps {
    card?: Card;
    address?: string;
    mode?: "viewer" | "profile";
    title?: string;
}

export default function MyBaseCardScreen({
    card,
    address,
    mode = "profile",
    title,
}: MyBaseCardScreenProps = {}) {
    if (mode === "viewer" || card || address) {
        return <MyBaseCardViewer card={card} address={address} title={title} />;
    }

    return <MyBaseCardProfile title={title} />;
}

export { MyBaseCardProfile, MyBaseCardViewer };
