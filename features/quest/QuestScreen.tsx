"use client";

import dynamic from "next/dynamic";

const QuestContent = dynamic(() => import("./QuestContent"), {
    ssr: false,
});

export default function QuestScreen() {
    return <QuestContent />;
}
