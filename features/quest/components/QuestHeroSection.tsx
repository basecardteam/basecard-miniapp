import QuestCardImage from "./QuestCardImage";
import BaseButton from "@/components/buttons/BaseButton";

export default function QuestHeroSection() {
    return (
        <div className="w-full flex flex-col items-center">
            {/* Title */}
            <h1 className="font-k2d text-[27px] font-bold text-white text-center mb-8 leading-[33px] tracking-[-0.05em] whitespace-nowrap">
                Your first onchain ID card
            </h1>

            {/* Central Card Image */}
            <div className="mb-8">
                <QuestCardImage />
            </div>

            {/* Process List */}
            <div className="w-full max-w-[340px] flex flex-col gap-2 mb-8 px-0 font-k2d pl-8">
                <div className="flex items-center gap-2 text-white text-[18px] font-semibold leading-[33px] tracking-[-0.05em]">
                    <span className="flex-shrink-0">1.</span>
                    <span>Mint your BaseCard</span>
                </div>
                <div className="flex items-center gap-2 text-white text-[18px] font-semibold leading-[33px] tracking-[-0.05em]">
                    <span className="flex-shrink-0">2.</span>
                    <span>Earn BC</span>
                </div>
                <div className="flex items-center gap-2 text-white text-[18px] font-semibold leading-[33px] tracking-[-0.05em]">
                    <span className="flex-shrink-0">3.</span>
                    <span>Use your BC points to earn USDC</span>
                </div>
            </div>

            {/* Mint Button */}
            {/* Mint Button */}
            <BaseButton className="w-[302px] mb-12">
                Mint your BaseCard
            </BaseButton>
        </div>
    );
}
