"use client";

import dynamic from "next/dynamic";

const EarnContent = dynamic(() => import("./EarnContent"), {
    ssr: false,
});

export default function EarnScreen() {
    return <EarnContent />;
}
