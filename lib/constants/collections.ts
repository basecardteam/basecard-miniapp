import { CollectionFilterTag } from "@/lib/filterCollections";

export const COLLECTION_TAGS: CollectionFilterTag[] = [
    "All",
    "Designer",
    "Dev",
    "MKT",
];

export const TAG_ROLE_MAP: Record<CollectionFilterTag, string | null> = {
    All: null,
    Designer: "Designer",
    Developer: "Developer",
    Marketer: "Marketer",
    Dev: "Developer",
    MKT: "Marketer",
};
