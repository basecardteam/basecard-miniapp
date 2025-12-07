"use client";

import { Suspense, lazy } from "react";

import { config } from "@/lib/common/config";

// MainHome lazy load with optional delay for testing
const MainHome = lazy(async () => {
    if (config.ENABLE_LAZY_LOAD_TEST) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return import("@/features/home/HomeScreen");
});

const MainSkeleton = () => (
    <div className="flex flex-col w-full gap-4 px-5">
        <div className="flex flex-col mt-5 gap-2">
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>
        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>
    </div>
);

// ... metadata ...

export default function MainPage() {
    return (
        <Suspense fallback={<MainSkeleton />}>
            <MainHome />
        </Suspense>
    );
}
