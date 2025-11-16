import { Card } from "@/lib/types";
import clsx from "clsx";

interface CardOverlayInfoProps {
    card: Card;
    isActive: boolean;
}

const CardOverlayInfo: React.FC<CardOverlayInfoProps> = ({ card, isActive }) => {
    return (
        <div
            className={clsx(
                "absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 text-right backdrop-blur-[2px]",
                "transition-all duration-400 ease-out will-change-transform will-change-opacity",
                isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
            )}
        >


            {card.skills && card.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 justify-end">
                    {card.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-white/15 text-white rounded-full text-[11px] font-k2d-regular"
                        >
                            {skill}
                        </span>
                    ))}
                    {card.skills.length > 3 && (
                        <span className="px-2 py-1 bg-white/15 text-white rounded-full text-[11px] font-k2d-regular">
                            +{card.skills.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default CardOverlayInfo;