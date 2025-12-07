"use client";

import { Suspense, lazy, use } from "react";
import { config } from "@/lib/common/config";

const CardViewerScreen = lazy(async () => {
    if (config.ENABLE_LAZY_LOAD_TEST) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return import("@/features/card-viewer/CardViewerScreen");
});

const CardSkeleton = () => (
    <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

interface CardPageProps {
    params: Promise<{ address: string }>;
}

export default function CardPage({ params }: CardPageProps) {
    const { address } = use(params);

    return (
        <Suspense fallback={<CardSkeleton />}>
            <CardViewerScreen address={address} />
        </Suspense>
    );
}
