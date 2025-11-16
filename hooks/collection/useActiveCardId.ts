import { useMemo } from "react";

type ItemWithId = { id: number };

type VirtualItem = {
    index: number;
    start: number;
    size: number;
};

type EstimateSizeFn = ((index: number) => number) | number | undefined;

export function useActiveCardId<T extends ItemWithId>(
    items: T[],
    virtualItems: VirtualItem[],
    listOffsetTop: number,
    viewportHeight: number,
    scrollOffset: number | null | undefined,
    estimateSize: EstimateSizeFn
) {
    return useMemo(() => {
        if (items.length === 0 || virtualItems.length === 0) {
            return null;
        }

        const currentScrollOffset = scrollOffset ?? 0;
        const viewportCenter = currentScrollOffset + viewportHeight / 2;

        let left = 0;
        let right = virtualItems.length - 1;
        let bestIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const item = virtualItems[mid];
            const itemMiddle = listOffsetTop + item.start + item.size / 2;
            const distance = itemMiddle - viewportCenter;
            const absDistance = Math.abs(distance);

            if (absDistance < bestDistance) {
                bestDistance = absDistance;
                bestIndex = mid;
            }

            if (distance === 0) {
                break;
            }

            if (distance < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (bestIndex >= 0) {
            const clampedIndex = Math.min(
                Math.max(virtualItems[bestIndex].index, 0),
                items.length - 1
            );
            return items[clampedIndex]?.id ?? null;
        }

        const estimate =
            typeof estimateSize === "function"
                ? estimateSize(0)
                : typeof estimateSize === "number"
                ? estimateSize
                : 200;

        const relativeCenter = viewportCenter - listOffsetTop;
        const approxIndex = Math.round(relativeCenter / estimate);
        const clampedIndex = Math.min(Math.max(approxIndex, 0), items.length - 1);

        return items[clampedIndex]?.id ?? null;
    }, [items, virtualItems, listOffsetTop, viewportHeight, scrollOffset, estimateSize]);
}


