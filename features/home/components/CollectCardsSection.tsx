"use client";

import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import {
    CollectionFilterTag,
    filterCollections,
} from "@/lib/filterCollections";
import { CollectionFilter } from "@/features/collection/components/CollectionFilter";
import { mockCards } from "@/lib/mocks/cards";
import IOSCardList from "./IOSCardList";

export default function CollectCardsSection() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
    const deferredSearchTerm = searchInput;

    const { data: myCard, isPending: isPendingMyCard, isError } = useMyBaseCard();
    // const cards = useMemo(() => (myCard ? [myCard] : []), [myCard]);
    const isPending = false;
    const cards = mockCards;

    const { filteredCards, tags } = useMemo(
        () => filterCollections(cards, selectedTag, deferredSearchTerm),
        [cards, selectedTag, deferredSearchTerm]
    );

    const isEmpty = !isPending && !isError && filteredCards.length === 0;

    return (
        <div className="bg-white pt-6 select-none">
            {/* Header + Search + Filter */}
            <div className="px-5">
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

            {/* iOS Style Card List */}
            {!isPending && !isError && !isEmpty && (
                <IOSCardList cards={filteredCards} />
            )}
        </div>
    );
}
