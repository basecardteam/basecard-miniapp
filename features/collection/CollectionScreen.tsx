"use client";

import dynamic from "next/dynamic";

const CollectionContent = dynamic(() => import("./CollectionContent"), {
    ssr: false,
});

export default function CollectionScreen() {
    return <CollectionContent />;
}
