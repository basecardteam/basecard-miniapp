"use client";

import { Suspense, lazy } from "react";

const MintScreen = lazy(() => import("@/features/mint/MintScreen"));

export default function MintPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MintScreen />
        </Suspense>
    );
}
