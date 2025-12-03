import { CollectionFilterTag } from "../legacy/collection";

export const COLLECTION_TAGS: CollectionFilterTag[] = [
    "All",
    "Designer",
    "Dev",
    "MKT",
];

export const TAG_ROLE_MAP: Record<CollectionFilterTag, string | null> = {
    All: null,
    Designer: "Designer",
    Dev: "Developer",
    MKT: "Marketer",
};
