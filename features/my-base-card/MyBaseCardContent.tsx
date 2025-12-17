"use client";

import MyBaseCardProfile from "./components/MyBaseCardProfile";
import MyBaseCardViewer from "./components/MyBaseCardViewer";

export interface MyBaseCardScreenProps {
    mode?: "viewer" | "profile";
    title?: string;
}

export default function MyBaseCardContent({
    mode = "profile",
    title,
}: MyBaseCardScreenProps = {}) {
    if (mode === "viewer") {
        return <MyBaseCardViewer title={title} />;
    }

    return <MyBaseCardProfile />;
}

export { MyBaseCardProfile, MyBaseCardViewer };
