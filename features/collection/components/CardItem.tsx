"use client";

import { Card } from "@/lib/types";
import { getIPFSUrl } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import CardOverlayInfo from "./CardOverlayInfo";

interface CardItemProps {
    card: Card;
    isActive: boolean;
    style?: React.CSSProperties;
}

const CardItem = React.memo(function CardItem({
    card,
    isActive,
    style,
}: CardItemProps) {
    const router = useRouter();
    const cardStyle = {
        opacity: isActive ? 1 : 0.85,
        zIndex: isActive ? 20 : 10,
    } satisfies React.CSSProperties;

    const handleCardClick = () => {
        router.push(`/card/${card.id}`);
    };

    return (
        <div
            data-card-id={card.id}
            className={clsx(
                "group relative cursor-pointer flex w-full mx-auto px-5 rounded-2xl",
                "transition-all duration-700 ease-out will-change-transform will-change-opacity",
                isActive
                    ? "drop-shadow-2xl shadow-black/25"
                    : "drop-shadow-md shadow-black/10"
            )}
            style={{ ...style, ...cardStyle }}
            onClick={handleCardClick}
        >
            <div
                className="relative overflow-hidden rounded-2xl"
                style={{ aspectRatio: "5/3", width: "100%" }}
            >
                <Image
                    src={getIPFSUrl(card.imageUri)}
                    alt={card.nickname || "Card image"}
                    fill={true}
                    priority={isActive}
                    style={{ objectFit: "cover" }}
                    className="object-cover aspect-[5/3] transition-transform duration-500 ease-out "
                    unoptimized={card.imageUri?.startsWith("data:") || false}
                    onError={(e) => {
                        e.currentTarget.src = "/assets/default-profile.png";
                    }}
                />

                <CardOverlayInfo card={card} isActive={isActive} />
            </div>
        </div>
    );
});

export default CardItem;
