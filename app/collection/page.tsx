"use client";

import { CollectionEmpty } from "@/components/collection/CollectionEmpty";
import { CollectionError } from "@/components/collection/CollectionError";
import { CollectionFilter } from "@/components/collection/CollectionFilter";
import { CollectionList } from "@/components/collection/CollectionList";
import { CollectionLoading } from "@/components/collection/CollectionLoading";
import BackButton from "@/components/common/BackButton";
import { useCollectionPage } from "@/hooks/collection/useCollectionPage";

export default function Collection() {
    const {
        selectedTag,
        setSelectedTag,
        tags,
        filteredCards,
        isMyCardLoading,
        myCardError,
        isLoading,
        error,
        allCards,
    } = useCollectionPage();

    const handleRetry = () => {
        window.location.reload();
    };


    return (
        < >
            <div className="relative ">
                <div className="flex gap-x-2 h-12 mb-5 items-center">
                    <BackButton className="relative top-0 left-0" />

                    <h2 className="text-3xl font-k2d-bold text-black tra">
                        My Collection
                    </h2>
                </div>

                <div className="px-5 ">
                    <CollectionFilter
                        tags={tags}
                        selectedTag={selectedTag}
                        onTagChange={setSelectedTag}
                    />
                    <div className="space-y-4 mt-5">
                        {isMyCardLoading || isLoading ? (
                            <CollectionLoading />
                        ) : myCardError || error ? (
                            <CollectionError error={myCardError || error} onRetry={handleRetry} />
                        ) : filteredCards.length === 0 ? (
                            <CollectionEmpty hasCards={allCards.length > 0} />
                        ) : (
                            <CollectionList
                                cards={filteredCards}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
