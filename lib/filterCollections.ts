import { Card } from "@/lib/types/api";

export type CollectionFilterTag =
    | "All"
    | "Developer"
    | "Designer"
    | "Marketer"
    | "Founder"
    | "BD"
    | "PM";

export const COLLECTION_FILTER_TAGS: CollectionFilterTag[] = [
    "All",
    "Developer",
    "Designer",
    "Marketer",
    "Founder",
    "BD",
    "PM",
];

interface FilterResult {
    filteredCards: Card[];
    tags: CollectionFilterTag[];
}

/**
 * Filter collections by tag and search term
 */
export function filterCollections(
    cards: Card[] | null | undefined,
    selectedTag: CollectionFilterTag,
    searchTerm?: string
): FilterResult {
    if (!cards || cards.length === 0) {
        return { filteredCards: [], tags: COLLECTION_FILTER_TAGS };
    }

    let filtered = [...cards];

    // Filter by tag (role)
    if (selectedTag !== "All") {
        filtered = filtered.filter(
            (card) => card.role?.toLowerCase() === selectedTag.toLowerCase()
        );
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(
            (card) =>
                card.nickname?.toLowerCase().includes(term) ||
                card.role?.toLowerCase().includes(term) ||
                card.bio?.toLowerCase().includes(term)
        );
    }

    return { filteredCards: filtered, tags: COLLECTION_FILTER_TAGS };
}
