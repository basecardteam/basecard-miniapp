import { CollectionEmpty } from "./components/CollectionEmpty";
import { CollectionError } from "./components/CollectionError";
import { CollectionFilter } from "./components/CollectionFilter";
import { CollectionList } from "./components/CollectionList";
import { CollectionLoading } from "./components/CollectionLoading";
import BackButton from "@/components/buttons/BackButton";
import { useCollectionPage } from "@/hooks/useCollectionPage";

export default function CollectionContent() {
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
        <>
            <div className="relative ">
                <div className="flex gap-x-2 h-12 mb-5 items-center">
                    <BackButton className="relative top-0 left-0" />

                    <h2 className="text-3xl font-k2d font-bold text-black tra">
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
                            <CollectionError
                                error={myCardError || error}
                                onRetry={handleRetry}
                            />
                        ) : filteredCards.length === 0 ? (
                            <CollectionEmpty hasCards={allCards.length > 0} />
                        ) : (
                            <CollectionList cards={filteredCards} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
