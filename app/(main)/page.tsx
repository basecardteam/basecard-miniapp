import MainHome from "@/components/main/MainHome";
import { Suspense } from "react";


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

export default function MainPage() {
    return (
        <Suspense fallback={<MainSkeleton />}>
            <MainHome />
        </Suspense>
    );
}
