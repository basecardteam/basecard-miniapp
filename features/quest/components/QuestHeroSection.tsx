import QuestCardImage from "./QuestCardImage";

const HERO_TITLE = "Your first onchain ID card";

const STEPS = [
    "Mint your BaseCard",
    "Earn BC",
    "Use your BC points to earn USDC",
];

export default function QuestHeroSection() {
    return (
        <div className="w-full flex flex-col items-center gap-y-7">
            <h1 className="font-k2d text-2xl font-bold text-white text-center whitespace-nowrap">
                {HERO_TITLE}
            </h1>

            <QuestCardImage />

            <div className="w-full flex sm:max-w-[70%] flex-col gap-1 pl-7 ">
                {STEPS.map((step, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-white text-lg font-medium  "
                    >
                        <span className="flex-shrink-0">{index + 1}.</span>
                        <span>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
