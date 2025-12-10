"use client";

import { Suspense, lazy } from "react";

const EditProfileScreen = lazy(
    () => import("@/features/edit-profile/EditProfileScreen")
);

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditProfileScreen />
        </Suspense>
    );
}
