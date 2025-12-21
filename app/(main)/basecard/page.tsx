import MyBaseCardScreen from "@/features/basecard/MyBaseCardScreen";
import { Suspense } from "react";

const CardSkeleton = () => (
    <div className="flex flex-col w-full gap-4 px-5">
        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>
    </div>
);

export default function BaseCardPage() {
    return (
        <Suspense fallback={<CardSkeleton />}>
            <MyBaseCardScreen mode="profile" />
        </Suspense>
    );
}
