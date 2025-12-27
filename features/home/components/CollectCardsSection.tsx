"use client";

import { CollectionFilter } from "@/features/collection/components/CollectionFilter";
import { useBaseCards } from "@/hooks/api/useBaseCards";
import { useUser } from "@/hooks/api/useUser";
import {
    CollectionFilterTag,
    filterCollections,
} from "@/lib/filterCollections";
import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import IOSCardList from "./IOSCardList";

export default function CollectCardsSection() {
    const [searchInput, setSearchInput] = useState("");
    const [selectedTag, setSelectedTag] = useState<CollectionFilterTag>("All");
    const deferredSearchTerm = searchInput;

    const { data: allCards, isError, isPending } = useBaseCards();
    const { card: myCard } = useUser();

    // Filter out my own card from the list
    const cards = useMemo(() => {
        if (!allCards) return [];
        if (!myCard?.id) return allCards;
        return allCards.filter((card) => card.id !== myCard.id);
    }, [allCards, myCard?.id]);

    const { filteredCards, tags } = useMemo(
        () => filterCollections(cards, selectedTag, deferredSearchTerm),
        [cards, selectedTag, deferredSearchTerm]
    );

    const isEmpty = !isPending && !isError && filteredCards.length === 0;
    const isSuccess = !isPending && !isError && !isEmpty;

    return (
        <div className="bg-white pt-5">
            {/* Header + Search + Filter */}
            <div className="text-3xl py-3 px-5 sm:text-4xl font-k2d font-bold text-black mb-2 tracking-tight">
                Collect cards
            </div>
            <div className="mb-3 relative mx-5 flex justify-center items-center ">
                <input
                    type="text"
                    placeholder="designer, dev, marketer, ..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`w-full h-10 px-4 pr-10 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-400 
                        focus:border-[#0050FF] focus:outline-none transition-colors text-base font-k2d font-normal
                    `}
                />
                <div
                    onClick={() => setSearchInput((value) => value.trim())}
                    className="absolute right-3 text-gray-400 hover:text-[#0050FF] transition-colors"
                >
                    <CiSearch size={24} />
                </div>
            </div>
            <CollectionFilter
                tags={tags}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
            />

            {/* State Handling */}
            {/* 1. Pending State */}
            {isPending && (
                <div className="px-5 mt-5">
                    <div className="relative w-full h-[200px] rounded-2xl bg-gray-200 overflow-hidden animate-pulse"></div>
                </div>
            )}

            {/* 2. Error State */}
            {isError && (
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

            {/* 3. Empty State */}
            {isEmpty && (
                <div className="px-5 my-5">
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

            {/* 4. Success State */}
            {isSuccess && <IOSCardList cards={filteredCards} />}
        </div>
    );
}
