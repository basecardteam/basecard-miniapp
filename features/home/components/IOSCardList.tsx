"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Card } from "@/lib/types/api";
import CardItem from "@/features/collection/components/CardItem";

interface IOSCardListProps {
    cards: Card[];
}

/**
 * 카드 리스트 - 스크롤 기반 애니메이션
 * 원래 위치 기반으로 계산하여 피드백 루프 방지
 */
export default function IOSCardList({ cards }: IOSCardListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    // 각 카드의 원래 offsetTop 저장 (transform 없는 상태 기준)
    const originalOffsets = useRef<Map<string, number>>(new Map());
    // RAF 중복 실행 방지
    const rafId = useRef<number | null>(null);

    // 원래 위치 기록 (최초 1회)
    const recordOriginalOffsets = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        cardRefs.current.forEach((el, id) => {
            if (!originalOffsets.current.has(id)) {
                // transform 없이 원래 위치 측정
                const prevTransform = el.style.transform;
                el.style.transform = "none";
                const offsetTop = el.offsetTop;
                el.style.transform = prevTransform;
                originalOffsets.current.set(id, offsetTop);
            }
        });
    }, []);

    const updateAllTransforms = useCallback(() => {
        const scrollContainer = document.querySelector(".scroll-container") as HTMLElement | null;
        if (!scrollContainer) return;

        const scrollTop = scrollContainer.scrollTop;

        // iOS safe area 고려한 실제 뷰포트 높이
        // scrollContainer의 실제 높이를 사용하면 safe area 자동 반영됨
        const viewportHeight = scrollContainer.clientHeight;

        const headerHeight = 60; // --header-h
        const bottomTabHeight =63;
        const bottomPadding = 40;

        const hiddenThreshold = 1.1;

        cards.forEach((card, index) => {
            const el = cardRefs.current.get(card.id);
            if (!el) return;

            // 첫번째 카드는 애니메이션 제외
            if (index === 0) {
                el.style.transform = "none";
                el.style.opacity = "1";
                return;
            }

            const originalTop = originalOffsets.current.get(card.id);
            if (originalTop === undefined) return;

            // 원래 위치 기준으로 뷰포트 내 위치 계산
            const cardTopInViewport = originalTop - scrollTop + headerHeight + bottomTabHeight + bottomPadding;
            const positionRatio = cardTopInViewport / viewportHeight;

            let scale = 1;
            let translateY = 0;
            let opacity = 1;

            // 애니메이션 구간
            const animationStart = 0.8;  // 애니메이션 시작
            const scaleEnd = 1.0;        // scale 변화 끝 (1→0.8)
            const fadeStart = 1.0;       // opacity 페이드 시작
            const finalScale = 0.8;
            const slowMotionFactor = 0.1; // 10% 속도로 천천히 이동

            if (positionRatio <= animationStart) {
                // 0 ~ 0.8: 정상 상태
                scale = 1;
                translateY = 0;
                opacity = 1;
            } else if (positionRatio < hiddenThreshold) {
                // 0.8 ~ 1.1: 애니메이션 구간

                // Scale: 0.8~1.0 구간에서 1 → 0.8, 이후 0.8 유지
                if (positionRatio < scaleEnd) {
                    const scaleProgress = (positionRatio - animationStart) / (scaleEnd - animationStart);
                    scale = 1 - (1 - finalScale) * scaleProgress;
                } else {
                    scale = finalScale;
                }

                // 슬로우 모션: 천천히 내려가는 것처럼 보임
                translateY = -(positionRatio - animationStart) * (1 - slowMotionFactor) * viewportHeight;

                // Opacity: 1.0 ~ 1.1 구간에서 1 → 0 (겹쳐진 상태에서 페이드아웃)
                if (positionRatio >= fadeStart) {
                    const fadeProgress = (positionRatio - fadeStart) / (hiddenThreshold - fadeStart);
                    opacity = 1 - fadeProgress;
                }
            } else {
                // 1.1+: 완전히 숨김
                scale = finalScale;
                translateY = -(hiddenThreshold - animationStart) * (1 - slowMotionFactor) * viewportHeight;
                opacity = 0;
            }

            // 값 반올림으로 미세 떨림 방지 + translate3d로 GPU 가속
            el.style.transform = `translate3d(0, ${Math.round(translateY)}px, 0) scale(${scale.toFixed(2)})`;
            el.style.opacity = String(opacity);
        });
    }, [cards]);

    // cards가 변경될 때 Map 정리 (태그 필터 변경 시)
    useEffect(() => {
        const currentCardIds = new Set(cards.map(c => c.id));

        // 현재 cards에 없는 id들 제거
        cardRefs.current.forEach((_, id) => {
            if (!currentCardIds.has(id)) {
                cardRefs.current.delete(id);
                originalOffsets.current.delete(id);
            }
        });
    }, [cards]);

    useEffect(() => {
        const scrollContainer = document.querySelector(".scroll-container");

        // 약간의 딜레이 후 원래 위치 기록 (레이아웃 완료 후)
        const timer = setTimeout(() => {
            recordOriginalOffsets();
            updateAllTransforms();
        }, 50);

        const handleScroll = () => {
            // 이전 RAF가 실행 중이면 취소하고 새로 예약
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
            rafId.current = requestAnimationFrame(() => {
                updateAllTransforms();
                rafId.current = null;
            });
        };

        const target = scrollContainer || window;
        target.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", () => {
            originalOffsets.current.clear();
            recordOriginalOffsets();
            updateAllTransforms();
        });

        return () => {
            clearTimeout(timer);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
            target.removeEventListener("scroll", handleScroll);
        };
    }, [recordOriginalOffsets, updateAllTransforms]);

    if (!cards.length) return null;

    return (
        <div ref={containerRef} className="flex flex-col gap-2 pt-4 pb-40 overflow-hidden">
            {cards.map((card, index) => (
                <div
                    key={card.id}
                    data-card-id={card.id}
                    ref={(el) => {
                        if (el) {
                            cardRefs.current.set(card.id, el);
                        } else {
                            cardRefs.current.delete(card.id);
                            originalOffsets.current.delete(card.id);
                        }
                    }}
                    className="flex justify-center"
                    style={{
                        zIndex: cards.length - index,
                        position: "relative",
                        transformOrigin: "center top",
                        willChange: "transform, opacity",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        // CSS가 scale 보간 처리 (부드러운 애니메이션)
                        transition: "transform 100ms linear",
                    }}
                >
                    <div className="w-full max-w-[440px]">
                        <CardItem card={card} isActive={true} />
                    </div>
                </div>
            ))}
        </div>
    );
}
