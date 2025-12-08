"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";

import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import {
    CollectionFilterTag,
    filterCollections,
} from "@/lib/filterCollections";
import { CollectionFilter } from "@/features/collection/components/CollectionFilter";
import CardItem from "@/features/collection/components/CardItem";

const SCROLL_STEP_PX = 260; // 한 카드가 교체되는 스크롤 거리
const STACK_SIZE = 4; // 동시에 보여줄 카드 수 (활성 + 다음 카드들)
const BASE_OFFSET_X = 0;
const BASE_OFFSET_Y = 16;
const BASE_OFFSET_Z = -120;
const SCALE_STEP = -0.06;
const HOLD = 0.35; // 활성 카드를 더 오래 보이게 유지하는 구간

// ===== Pure helpers (no React deps) =====
function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

function easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
}

function mapWithHold(t: number, hold: number): number {
    return clamp01((t - hold) / (1 - hold));
}

type TransformTuple = {
    tx: number;
    ty: number;
    tz: number;
    sc: number;
    op: number;
    blur: number;
};

function computeLayerTransform(
    layerIndex: number,
    depth: number,
    progress: number
): TransformTuple {
    const baseX = BASE_OFFSET_X * depth;
    const baseY = BASE_OFFSET_Y * depth;
    const baseZ = BASE_OFFSET_Z * depth;
    const baseScale = 1 + SCALE_STEP * depth;

    // defaults
    let tx = baseX;
    let ty = baseY;
    let tz = baseZ;
    let sc = baseScale;
    let op = 1;
    let blur = 0;

    if (layerIndex === 0) {
        const p = mapWithHold(progress, HOLD);
        const fade = Math.pow(p, 1.6);
        ty = -80 * p;
        tz = 90 * p;
        sc = 1 + 0.03 * p;
        op = 1; // opacity 고정
        blur = 0;
    } else if (layerIndex === 1) {
        const p = easeOutSine(mapWithHold(progress, HOLD));
        tx = baseX * (1 - p);
        ty = baseY * (1 - p);
        tz = baseZ * (1 - p); // -120 -> 0
        sc = baseScale + (1 - baseScale) * p; // 작은 스케일 -> 1
        // 블러 중심 연출: 들어올수록 선명해짐 (강도 완화)
        op = 1;
        blur = Math.max(0, (1 - p) * 3);
    } else {
        const p = mapWithHold(progress, HOLD);
        const damp = Math.max(0, 1 - (layerIndex - 1) * 0.35);
        tx = baseX - baseX * 0.1 * p * damp;
        ty = baseY - baseY * 0.1 * p * damp;
        tz = baseZ - baseZ * 0.1 * p * damp;
        sc = baseScale + 0.01 * p * damp;
        op = 1;
        // 더 뒤쪽일수록 살짝 더 흐림 (강도 완화)
        blur = Math.min(5, 1 + (layerIndex - 1) * 1);
    }

    return { tx, ty, tz, sc, op, blur };
}
const START_OFFSET_PX = 140; // 섹션 시작보다 이만큼 먼저 고정 시작
const END_OFFSET_PX = 0; // 필요 시 끝 지점도 보정
const SNAP_DELAY_MS = 100; // 스크롤 멈춤 감지 대기 시간
const SNAP_SCROLL_MS = 200; // 프로그램적 스크롤 예상 시간

export default function CollectCardsSection() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
    const deferredSearchTerm = searchInput; // 단순화

    const { data: myCard, isPending, isError } = useMyBaseCard();
    const cards = useMemo(() => (myCard ? [myCard] : []), [myCard]);

    const { filteredCards, tags } = useMemo(
        () => filterCollections(cards, selectedTag, deferredSearchTerm),
        [cards, selectedTag, deferredSearchTerm]
    );

    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [viewportH, setViewportH] = useState(0);
    const [sectionTop, setSectionTop] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [headerH, setHeaderH] = useState(0);
    const [innerScrollY, setInnerScrollY] = useState(0);

    const headerRef = useRef<HTMLDivElement | null>(null);
    const innerScrollRef = useRef<HTMLDivElement | null>(null);
    const snappingRef = useRef(false);
    const snapTimerRef = useRef<number | null>(null);
    const scrollTopRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);
    const prevStepRef = useRef(0);
    const snapTargetRef = useRef<number | null>(null);

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
    }, []);

    // 카드 데이터 갯수 변동 시 스텝/스크롤 초기화로 점프 방지
    useEffect(() => {
        const currentTop = innerScrollRef.current?.scrollTop ?? 0;
        prevStepRef.current = Math.min(
            Math.max(Math.round(currentTop / SCROLL_STEP_PX), 0),
            Math.max(filteredCards.length - 1, 0)
        );
        snapTargetRef.current = null;
        setInnerScrollY(currentTop);
    }, [filteredCards.length]);

    // 스크롤 위치 추적 (페이지 스크롤)
    useEffect(() => {
        const onScroll = () => {
            setScrollY(window.scrollY || window.pageYOffset || 0);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 언마운트 시 스냅 타이머 정리
    useEffect(() => {
        return () => {
            if (snapTimerRef.current) {
                window.clearTimeout(snapTimerRef.current);
                snapTimerRef.current = null;
            }
        };
    }, []);

    // 필터 태그 변경 시 스크롤/스냅 상태 초기화
    useEffect(() => {
        const el = innerScrollRef.current;
        if (!el) return;
        el.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        prevStepRef.current = 0;
        snapTargetRef.current = 0;
        setInnerScrollY(0);
    }, [selectedTag]);

    const handleInnerScroll = useCallback(() => {
        const el = innerScrollRef.current;
        if (!el) return;
        // rAF로 배치 업데이트
        scrollTopRef.current = el.scrollTop;
        // 스냅 중에는 rAF 업데이트 자체를 생략 (계산 흔들림 방지)
        if (!snappingRef.current && rafIdRef.current === null) {
            rafIdRef.current = window.requestAnimationFrame(() => {
                rafIdRef.current = null;
                const next = scrollTopRef.current;
                // 미세 변화 무시하여 리렌더 감소
                if (Math.abs(next - innerScrollY) >= 0.5) {
                    setInnerScrollY(next);
                }
            });
        }

        // 스크롤 멈춤 디바운스 후 스냅
        if (snapTimerRef.current) {
            window.clearTimeout(snapTimerRef.current);
        }
        // 스냅 진행 중에는 추가 스냅 예약 금지
        if (snappingRef.current) return;
        snapTimerRef.current = window.setTimeout(() => {
            if (!innerScrollRef.current) return;
            const current = innerScrollRef.current.scrollTop;
            // 간소화: 가장 가까운 스텝으로 스냅
            const targetStepRounded = Math.round(current / SCROLL_STEP_PX);
            const targetStep = Math.min(
                Math.max(targetStepRounded, 0),
                totalSteps
            );
            // 안전 클램프
            // 동일 스텝이면 스냅 불필요
            if (targetStep === prevStepRef.current) {
                return;
            }
            const target = targetStep * SCROLL_STEP_PX;
            snappingRef.current = true;
            snapTargetRef.current = target;
            prevStepRef.current = targetStep;
            innerScrollRef.current.scrollTo({
                top: target,
                behavior: "smooth",
            });
            // 예상 스크롤 종료 시점에 플래그 해제
            window.setTimeout(() => {
                snappingRef.current = false;
                // 스냅 완료 위치를 기준으로 진행도 보정
                if (innerScrollRef.current) {
                    // 목표 근처에서 미세 흔들림 제거: 정확히 고정
                    if (snapTargetRef.current !== null) {
                        const diff = Math.abs(
                            innerScrollRef.current.scrollTop -
                                snapTargetRef.current
                        );
                        if (diff > 0 && diff < SCROLL_STEP_PX) {
                            innerScrollRef.current.scrollTo({
                                top: snapTargetRef.current,
                            });
                        }
                        // 완료 후 상태 갱신
                    }
                    setInnerScrollY(innerScrollRef.current.scrollTop);
                }
                snapTargetRef.current = null;
            }, SNAP_SCROLL_MS);
        }, SNAP_DELAY_MS);
    }, [innerScrollY, filteredCards.length]);

    const totalSteps = Math.max(filteredCards.length - 1, 0);
    // 섹션 전체 높이: 뷰포트 한 화면 + 단계별 스크롤 거리
    const totalHeight = Math.max(viewportH, 0) + totalSteps * SCROLL_STEP_PX;

    // 섹션 내 상대 스크롤량 계산 (섹션이 화면 상단에 닿는 시점부터 진행)
    const usingInnerScroll = innerScrollRef.current !== null;
    const clamp = (v: number) =>
        Math.min(Math.max(v, 0), Math.max(totalSteps * SCROLL_STEP_PX, 0));
    // 스냅 중에는 계산용 스크롤 값을 스냅 타깃으로 고정하여 움찔거림 방지
    const calcScrollTop =
        snappingRef.current && snapTargetRef.current !== null
            ? snapTargetRef.current
            : usingInnerScroll
            ? innerScrollY
            : scrollY - sectionTop;
    const relativeY = useMemo(
        () => clamp(calcScrollTop),
        [calcScrollTop, totalSteps]
    );

    // 스크롤 높이 기반으로 활성 스텝/진행 계산 (간단/일관)
    const activeIndex = useMemo(() => {
        return Math.min(
            Math.max(Math.round(relativeY / SCROLL_STEP_PX), 0),
            Math.max(filteredCards.length - 1, 0)
        );
    }, [relativeY, filteredCards.length]);
    const stepProgress = useMemo(() => {
        const startTop = activeIndex * SCROLL_STEP_PX;
        const within = clamp(calcScrollTop) - startTop;
        return Math.min(Math.max(within / SCROLL_STEP_PX, 0), 1);
    }, [activeIndex, calcScrollTop]);
    const startPin = sectionTop - START_OFFSET_PX;
    // 스테이지 표시 높이: (뷰포트 - 헤더 높이)
    const pinHeight = Math.max(viewportH - headerH, 0);
    const endPin = sectionTop + totalHeight - pinHeight + END_OFFSET_PX;
    const inView = usingInnerScroll
        ? true
        : scrollY >= startPin && scrollY <= endPin;

    // 내부 스크롤 진행률 (0..1)
    const scrollProgress = useMemo(() => {
        const denom = Math.max(totalSteps * SCROLL_STEP_PX, 1);
        return Math.min(Math.max(innerScrollY / denom, 0), 1);
    }, [innerScrollY, totalSteps]);

    const isEmpty = !isPending && !isError && filteredCards.length === 0;

    return (
        <div className="bg-white pt-6">
            {/* Header + Search + Filter */}
            <div ref={headerRef} className="px-5">
                <h2 className="text-3xl sm:text-4xl font-k2d font-bold text-black mb-2 tracking-tight">
                    Collect cards
                </h2>
                <div className="mb-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="designer, dev, marketer, ..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-12 px-4 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 focus:border-[#0050FF] focus:outline-none transition-colors text-base font-k2d font-normal"
                        />
                        <button
                            onClick={() =>
                                setSearchInput((value) => value.trim())
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0050FF] transition-colors"
                        >
                            <CiSearch size={24} />
                        </button>
                    </div>
                </div>
                <CollectionFilter
                    tags={tags}
                    selectedTag={selectedTag}
                    onTagChange={setSelectedTag}
                />
            </div>

            {/* States: Loading / Error / Empty */}
            {isPending && (
                <div className="px-5 mt-5">
                    <div className="relative w-full h-[200px] rounded-2xl bg-gray-200 overflow-hidden animate-pulse"></div>
                </div>
            )}
            {!isPending && isError && (
                <div className="px-5">
                    <div className="w-full h-[240px] rounded-2xl border border-gray-200/70 bg-white flex items-center justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg bg-black text-white text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
            {!isPending && !isError && isEmpty && (
                <div className="px-5">
                    <div className="w-full h-[240px] rounded-2xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2">
                        <div className="text-gray-500 font-k2d font-normal">
                            No cards found
                        </div>
                        <div className="text-gray-400 text-sm">
                            Try changing filters or searching for other keywords
                        </div>
                    </div>
                </div>
            )}

            {/* Stacked Cards Stage (fixed overlay below header) */}
            <div
                className="relative h-[240px] overflow-y-auto overscroll-y-none scrollbar-hide"
                ref={innerScrollRef}
                onScroll={handleInnerScroll}
                style={{
                    // Hide scrollbar (Firefox/IE/Edge)
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {!isPending && !isError && !isEmpty && inView && (
                    <div
                        className=" sticky top-0 right-0 left-0 flex items-center justify-center z-10  scrollbar-hide"
                        style={{
                            zIndex: 40,
                            height: "100%",
                        }}
                    >
                        {/* Soft top/bottom gradient masks to blend edges */}
                        <div
                            className="absolute top-0 left-0 right-0 h-8"
                            style={{
                                background:
                                    "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))",
                            }}
                        />
                        <div
                            className="absolute bottom-0 left-0 right-0 h-8"
                            style={{
                                background:
                                    "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
                            }}
                        />
                        <div
                            className="w-full flex items-center justify-center overflow-hidden"
                            style={{ height: "100%" }}
                        >
                            <div
                                className="relative w-full mx-auto flex items-center justify-center "
                                style={{ perspective: 1200, height: "100%" }}
                            >
                                <div className="relative w-full ">
                                    {renderStack({
                                        cards: filteredCards,
                                        activeIndex,
                                        progress: stepProgress,
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* 여분 스크롤 제거: 정확히 스텝 수만큼만 스크롤 가능 */}
                <div
                    ref={sectionRef}
                    className="relative w-full"
                    style={{ height: Math.max(totalSteps * SCROLL_STEP_PX, 0) }}
                />
            </div>
            {/* Progress bar - subtle, blends with UI */}
            {!isPending && !isError && !isEmpty && (
                <div className="w-full h-1 rounded-full bg-gray-200/80 overflow-hidden  border border-gray-100/60">
                    <div
                        className="h-full bg-[#0050FF]/70 transition-[width] duration-120 ease-out"
                        style={{ width: `${scrollProgress * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function renderStackItems(cards: any[], activeIndex: number, progress: number) {
    const maxIndex = cards.length - 1;
    const items: React.ReactElement[] = [];
    for (let layer = 0; layer < STACK_SIZE; layer++) {
        const i = activeIndex + layer;
        if (i > maxIndex) break;
        const card = cards[i];
        const { tx, ty, tz, sc, op, blur } = computeLayerTransform(
            layer,
            layer,
            progress
        );

        const style: React.CSSProperties = {
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translate3d(${tx}px, ${ty}px, ${tz}px) scale(${sc})`,
            transition:
                "transform 180ms var(--card-ease, cubic-bezier(.22,.61,.36,1)), filter 180ms var(--card-ease, cubic-bezier(.22,.61,.36,1))",
            willChange: "transform, filter",
            filter: blur > 0 ? `blur(${blur}px)` : "none",
            zIndex: 100 - layer,
            // pointerEvents: "none",
        };

        items.push(
            <div key={card.id} style={style}>
                <div
                    className="w-full mx-auto px-5"
                    style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "visible",
                    }}
                >
                    <CardItem
                        card={card}
                        isActive={layer === 0 && progress < 0.9}
                    />
                </div>
            </div>
        );
    }
    return items;
}

function renderStack({
    cards,
    activeIndex,
    progress,
}: {
    cards: any[];
    activeIndex: number;
    progress: number; // 0..1
}) {
    if (!cards.length) return null;
    return (
        <div
            className="relative w-full"
            style={{ height: "100%", transformStyle: "preserve-3d" }}
        >
            {renderStackItems(cards, activeIndex, progress)}
        </div>
    );
}
