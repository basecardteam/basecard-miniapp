export const CardLoadingState = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <div className="animate-pulse text-gray-400 text-lg">
                Loading your card...
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
