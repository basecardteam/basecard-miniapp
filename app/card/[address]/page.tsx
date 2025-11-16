"use client";

import MyCard from "@/components/main/myCard/MyCard";
import { use } from "react";

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

    return <div className="relative">
        <MyCard address={address} mode="viewer" title="" />
    </div>;
}
