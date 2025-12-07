import BaseButton from "@/components/buttons/BaseButton";

// Error/No Card State Component
export const NoCardState = ({
    onNavigateToMint,
}: {
    onNavigateToMint: () => void;
}) => (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0050FF] to-[#0080FF] px-6 py-8">
        <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-5xl sm:text-6xl font-k2d font-bold text-white drop-shadow-lg tracking-tight leading-tight">
                No Card Found
            </h1>
            <p className="text-xl sm:text-2xl font-k2d font-medium text-white max-w-md drop-shadow-md">
                Create your onchain identity
                <br />
                and start building your story
            </p>
            <BaseButton onClick={onNavigateToMint}>Mint Your Card</BaseButton>
        </div>
    </div>
);
