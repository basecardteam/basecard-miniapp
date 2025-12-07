"use client";

import dynamic from "next/dynamic";
import { MyBaseCardScreenProps } from "./MyBaseCardContent";

const MyBaseCardContent = dynamic(() => import("./MyBaseCardContent"), {
    ssr: false,
});

export default function MyBaseCardScreen(props: MyBaseCardScreenProps) {
    return <MyBaseCardContent {...props} />;
}
