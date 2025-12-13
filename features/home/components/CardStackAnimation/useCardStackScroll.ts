"use client";

import { useCallback, useEffect, useMemo, useRef, useState, RefObject } from "react";
import { SCROLL_STEP_PX, START_OFFSET_PX, END_OFFSET_PX } from "./config";

export interface UseCardStackScrollProps {
    filteredCardsLength: number;
    sectionRef: RefObject<HTMLDivElement | null>;
    headerRef: RefObject<HTMLDivElement | null>;
    scrollStepPx?: number;
    onFilterChange?: () => void;
}

export interface UseCardStackScrollReturn {
    innerScrollRef: RefObject<HTMLDivElement | null>;
    activeIndex: number;
    stepProgress: number;
    scrollProgress: number;
    inView: boolean;
    totalSteps: number;
    handleInnerScroll: () => void;
    sectionRef: RefObject<HTMLDivElement | null>;
}

export function useCardStackScroll({
    filteredCardsLength,
    sectionRef,
    headerRef,
    scrollStepPx = SCROLL_STEP_PX,
    onFilterChange,
}: UseCardStackScrollProps): UseCardStackScrollReturn {
    const [viewportH, setViewportH] = useState(0);
    const [sectionTop, setSectionTop] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [headerH, setHeaderH] = useState(0);
    const [innerScrollY, setInnerScrollY] = useState(0);

    const innerScrollRef = useRef<HTMLDivElement | null>(null);
    const scrollTopRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);

    // 뷰포트 높이 및 섹션 시작 위치 계산
    useEffect(() => {
        const recalc = () => {
            setViewportH(
                typeof window !== "undefined" ? window.innerHeight : 0
            );
            // 헤더(제목/검색/필터) 실제 높이 측정
            const headerEl = headerRef.current;
            setHeaderH(headerEl ? headerEl.offsetHeight : 0);
            const el = sectionRef.current;
            if (!el) {
                setSectionTop(0);
                return;
            }
            let offset = 0;
            let node: HTMLElement | null = el;
            while (node) {
                offset += node.offsetTop;
                node = node.offsetParent as HTMLElement | null;
            }
            setSectionTop(offset);
        };
        recalc();
        window.addEventListener("resize", recalc);
        return () => window.removeEventListener("resize", recalc);
    }, [sectionRef, headerRef]);

    // 카드 데이터 갯수 변동 시 스크롤 초기화로 점프 방지
    useEffect(() => {
        const currentTop = innerScrollRef.current?.scrollTop ?? 0;
        setInnerScrollY(currentTop);
    }, [filteredCardsLength, scrollStepPx]);

    // 스크롤 위치 추적 (페이지 스크롤)
    useEffect(() => {
        const onScroll = () => {
            setScrollY(window.scrollY || window.pageYOffset || 0);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 필터 변경 시 스크롤 상태 초기화
    useEffect(() => {
        const el = innerScrollRef.current;
        if (!el) return;
        el.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        setInnerScrollY(0);
        onFilterChange?.();
    }, [onFilterChange]);

    const totalSteps = Math.max(filteredCardsLength - 1, 0);

    const handleInnerScroll = useCallback(() => {
        const el = innerScrollRef.current;
        if (!el) return;
        // rAF로 배치 업데이트
        scrollTopRef.current = el.scrollTop;
        if (rafIdRef.current === null) {
            rafIdRef.current = window.requestAnimationFrame(() => {
                rafIdRef.current = null;
                const next = scrollTopRef.current;
                // 미세 변화 무시하여 리렌더 감소
                if (Math.abs(next - innerScrollY) >= 0.5) {
                    setInnerScrollY(next);
                }
            });
        }
    }, [innerScrollY]);

    // 섹션 전체 높이: 뷰포트 한 화면 + 단계별 스크롤 거리
    const totalHeight = Math.max(viewportH, 0) + totalSteps * scrollStepPx;

    // 섹션 내 상대 스크롤량 계산 (섹션이 화면 상단에 닿는 시점부터 진행)
    const usingInnerScroll = innerScrollRef.current !== null;
    const clamp = (v: number) =>
        Math.min(Math.max(v, 0), Math.max(totalSteps * scrollStepPx, 0));
    const calcScrollTop = usingInnerScroll ? innerScrollY : scrollY - sectionTop;
    const relativeY = useMemo(
        () => clamp(calcScrollTop),
        [calcScrollTop, totalSteps, scrollStepPx]
    );

    // 스크롤 높이 기반으로 활성 스텝/진행 계산 (floor 사용 - 스냅 없이 연속적)
    const activeIndex = useMemo(() => {
        return Math.min(
            Math.max(Math.floor(relativeY / scrollStepPx), 0),
            Math.max(filteredCardsLength - 1, 0)
        );
    }, [relativeY, filteredCardsLength, scrollStepPx]);

    const stepProgress = useMemo(() => {
        const startTop = activeIndex * scrollStepPx;
        const within = clamp(calcScrollTop) - startTop;
        return Math.min(Math.max(within / scrollStepPx, 0), 1);
    }, [activeIndex, calcScrollTop, scrollStepPx]);

    const startPin = sectionTop - START_OFFSET_PX;
    // 스테이지 표시 높이: (뷰포트 - 헤더 높이)
    const pinHeight = Math.max(viewportH - headerH, 0);
    const endPin = sectionTop + totalHeight - pinHeight + END_OFFSET_PX;
    const inView = usingInnerScroll
        ? true
        : scrollY >= startPin && scrollY <= endPin;

    // 내부 스크롤 진행률 (0..1)
    const scrollProgress = useMemo(() => {
        const denom = Math.max(totalSteps * scrollStepPx, 1);
        return Math.min(Math.max(innerScrollY / denom, 0), 1);
    }, [innerScrollY, totalSteps, scrollStepPx]);

    return {
        innerScrollRef,
        activeIndex,
        stepProgress,
        scrollProgress,
        inView,
        totalSteps,
        handleInnerScroll,
        sectionRef,
    };
}
