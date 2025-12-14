import { CollectionFilterTag } from "@/lib/filterCollections";

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
    return (
        <div className="w-full overflow-hidden pl-5">
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 w-max py-1 pr-5">
                    {tags.map((tag) => {
                        const isSelected = selectedTag === tag;
                        return (
                            <div
                                key={tag}
                                onClick={() => onTagChange(tag)}
                                className={`leading-none px-4 py-2 text-sm font-medium font-k2d rounded-full border transition-colors duration-200
                                ${isSelected ? "bg-white text-[#0050FF]    border-[#0050FF]"
                                : "bg-[#F0F0F0] text-black  border-transparent "
                            }`}>
                                {tag}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
