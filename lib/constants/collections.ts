import { CollectionFilterTag } from "@/lib/filterCollections";

export const COLLECTION_TAGS: CollectionFilterTag[] = [
    "All",
    "Developer",
    "Designer",
    "Marketer",
    "Founder",
    "BD",
    "PM",
];

export const TAG_ROLE_MAP: Record<CollectionFilterTag, string | null> = {
    All: null,
    Developer: "Developer",
    Designer: "Designer",
    Marketer: "Marketer",
    Founder: "Founder",
    BD: "BD",
    PM: "PM",
};
