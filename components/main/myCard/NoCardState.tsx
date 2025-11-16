// Error/No Card State Component
export const NoCardState = ({ onNavigateToMint }: { onNavigateToMint: () => void }) => (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF] px-6 py-8">
        <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-5xl sm:text-6xl font-k2d-bold text-white drop-shadow-lg tracking-tight leading-tight">
                No Card Found
            </h1>
            <p className="text-xl sm:text-2xl font-k2d-medium text-white max-w-md drop-shadow-md">
                Create your onchain identity
                <br />
                and start building your story
            </p>
            <button
                onClick={onNavigateToMint}
                className="w-full max-w-md py-4 bg-gray-900 hover:bg-gray-800 active:bg-black text-white font-k2d-semibold rounded-xl transition-all duration-300 shadow-xl text-lg transform hover:scale-105 active:scale-95 mt-4"
            >
                Mint Your Card
            </button>
        </div>
    </div>
);