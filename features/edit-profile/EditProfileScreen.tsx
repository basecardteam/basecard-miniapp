"use client";

import dynamic from "next/dynamic";

const EditProfileContent = dynamic(() => import("./EditProfileContent"), {
    ssr: false,
});

export default function EditProfileScreen() {
    return <EditProfileContent />;
}
