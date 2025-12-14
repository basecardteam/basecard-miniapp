export const CardLoadingState = () => {
    return (
        <div className="flex items-center justify-center w-[80%] p-2 mx-auto object-cover aspect-[5/3] ">
            <div className="w-full h-full rounded-2xl bg-gray-800 animate-pulse flex items-center px-6 gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-700 shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="w-32 h-4 rounded bg-gray-700" />
                    <div className="w-20 h-3 rounded bg-gray-700" />
                </div>
            </div>
        </div>
    );
};

export const CardEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-3">
            <p className="text-gray-500 text-base">No BaseCard yet</p>
        </div>
    );
};

export const CardConnectWalletState = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <p className="text-gray-500 text-base">
                Connect wallet to view your card
            </p>
        </div>
    );
};
