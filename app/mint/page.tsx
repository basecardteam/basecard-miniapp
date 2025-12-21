"use client";

import { Suspense, lazy } from "react";

const MintScreen = lazy(() => import("@/features/mint/MintScreen"));

const MintSkeleton = () => (
    <div className="flex flex-col w-full min-h-screen bg-white">
        {/* Back button */}
        <div className="p-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col px-5 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-3">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-xl w-full animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-xl w-full animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-xl w-full animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-xl w-full animate-pulse" />
            </div>
        </div>
    </div>
);

export default function MintPage() {
    return (
        <Suspense fallback={<MintSkeleton />}>
            <MintScreen />
        </Suspense>
    );
}
