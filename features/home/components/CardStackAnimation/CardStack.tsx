"use client";

import React from "react";
import { Card } from "@/lib/types/api";
import { CardStackAnimationStrategy } from "./types";
import CardItem from "@/features/collection/components/CardItem";
import { MAX_CARD_WIDTH, CARD_HORIZONTAL_PADDING } from "./config";

interface CardStackProps {
    cards: Card[];
    activeIndex: number;
    progress: number; // 0..1
    strategy: CardStackAnimationStrategy;
}

/**
 * 카드 스택 컴포넌트
 * 전략을 받아서 카드 스택을 렌더링
 */
export default function CardStack({
    cards,
    activeIndex,
    progress,
    strategy,
}: CardStackProps) {
    if (!cards.length) return null;

    // 전략의 visibleCardCount를 사용하되, 최소 STACK_SIZE는 4로 유지
    const stackSize = Math.max(
        strategy.visibleCardCount + 3,
        4
    );

    // 이전 카드 수 (사라지는 카드들)
    const prevCardCount = 2;

    const maxIndex = cards.length - 1;
    const items: React.ReactElement[] = [];

    // 이전 카드부터 앞으로의 카드까지 렌더링 (layer: -prevCardCount ~ stackSize-1)
    for (let layer = -prevCardCount; layer < stackSize; layer++) {
        const i = activeIndex + layer;
        if (i < 0 || i > maxIndex) continue;

        const card = cards[i];
        const { tx, ty, tz, sc, op, blur } = strategy.computeLayerTransform(
            layer,
            layer,
            progress
        );

        // 이전 카드(layer < 0)와 현재 활성 카드(layer === 0)는 사라지는 효과 적용
        // 뒤에 카드들(layer >= 1)은 효과 없이 평면적으로만
        const isBackCard = layer >= 1;
        const isPrevCard = layer < 0;

        const style: React.CSSProperties = {
            position: "absolute",
            inset: 0,
            transformStyle: (isBackCard) ? "flat" : "preserve-3d",
            transformOrigin: "center top",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            transform: isBackCard
                ? `translate3d(${tx}px, ${ty}px, 0px)`
                : `translate3d(${tx}px, ${ty}px, ${tz}px) scale(${sc})`,
            transition: isBackCard
                ? "transform 180ms var(--card-ease, cubic-bezier(.22,.61,.36,1))"
                : "transform 180ms var(--card-ease, cubic-bezier(.22,.61,.36,1)), filter 180ms var(--card-ease, cubic-bezier(.22,.61,.36,1))",
            willChange: "transform",
            filter: isBackCard ? "none" : (blur > 0 ? `blur(${blur}px)` : "none"),
            opacity: op,
            // 이전 카드는 가장 낮은 z-index, 현재 카드가 가장 높음
            zIndex: isPrevCard ? (5 + layer) : (isBackCard ? 10 : (100 - layer)),
        };

        items.push(
            <div key={card.id} style={style}>
                <div
                    className="w-full mx-auto px-5"
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        overflow: "visible",
                        maxWidth: MAX_CARD_WIDTH + CARD_HORIZONTAL_PADDING,
                    }}
                >
                    <CardItem
                        card={card}
                        isActive={layer === 0 ? progress < 0.9 : true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full"
            style={{ height: "100%", transformStyle: "preserve-3d" }}
        >
            {items}
        </div>
    );
}
