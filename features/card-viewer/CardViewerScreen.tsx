"use client";

import dynamic from "next/dynamic";

const CardViewerContent = dynamic(() => import("./CardViewerContent"), {
    ssr: false,
});

interface CardViewerScreenProps {
    address: string;
}

export default function CardViewerScreen(props: CardViewerScreenProps) {
    return <CardViewerContent {...props} />;
}
