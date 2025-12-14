
const HomeSkeleton = () => (
    <div className="flex flex-col w-full gap-4 px-5">
        {/* 1. Title Skeleton */}
        <div className="flex flex-col mt-5 gap-2">
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>

        {/* 2. Card Image Skeleton (가장 큰 영역) */}
        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>

        <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />

        {/* 3. Buttons Section Skeleton */}
        <div className="w-full flex gap-x-3">
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="py-2 flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>

        <div className="w-full rounded-2xl sm:rounded-3xl relative">
            <div className="w-full h-52 bg-gray-200 rounded-2xl animate-pulse drop-shadow-lg" />
        </div>
    </div>
);

export default HomeSkeleton