import { CollectionFilterTag } from "@/lib/filterCollections";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

interface CollectionFilterProps {
    tags: CollectionFilterTag[];
    selectedTag: CollectionFilterTag;
    onTagChange: (tag: CollectionFilterTag) => void;
}

export function CollectionFilter({
    tags,
    selectedTag,
    onTagChange,
}: CollectionFilterProps) {
    const activeIndex = useMemo(
        () => tags.findIndex((tag) => tag === selectedTag),
        [tags, selectedTag]
    );
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicator, setIndicator] = useState({ width: 0, left: 0 });

    useEffect(() => {
        const activeEl = buttonRefs.current[activeIndex];
        if (activeEl) {
            const { offsetWidth, offsetLeft } = activeEl;
            setIndicator({ width: offsetWidth, left: offsetLeft });
        }
    }, [activeIndex, tags.length]);

    return (
        <div className="w-full">
            <div className="relative inline-flex w-full justify-start rounded-full bg-[#F0F0F0] p-1">
                <span
                    className="absolute inset-y-1 rounded-full bg-white shadow-sm transition-[transform,width] duration-250 ease-out will-change-transform"
                    style={{
                        width: indicator.width,
                        transform: `translateX(${indicator.left}px)`,
                    }}
                    aria-hidden
                />

                {tags.map((tag, index) => {
                    const isSelected = selectedTag === tag;
                    return (
                        <button
                            key={tag}
                            ref={(el) => {
                                buttonRefs.current[index] = el;
                            }}
                            onClick={() => onTagChange(tag)}
                            className={clsx(
                                "relative flex-1 min-w-0 px-4 py-2 text-sm transition-colors duration-200",
                                "rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                                isSelected
                                    ? "text-[#0050FF] font-k2d font-bold"
                                    : "text-black font-k2d font-medium"
                            )}
                        >
                            <span className="relative z-10 truncate">
                                {tag}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
