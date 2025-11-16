"use client";

import { Card } from "@/lib/types";

import MyCardProfile from "./MyCardProfile";
import MyCardViewer from "./MyCardViewer";

interface MyCardProps {
    card?: Card;
    address?: string;
    mode?: "viewer" | "profile";
    title?: string;
}

export default function MyCard({ card, address, mode = "profile", title }: MyCardProps = {}) {
    if (mode === "viewer" || card || address) {
        return <MyCardViewer card={card} address={address} title={title} />;
    }

    return <MyCardProfile title={title} />;
}

export { MyCardProfile, MyCardViewer };
