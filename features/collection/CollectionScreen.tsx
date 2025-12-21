import BackButton from "@/components/buttons/BackButton";
import { useCollectionPage } from "@/hooks/useCollectionPage";
import { CollectionEmpty } from "./components/CollectionEmpty";
import { CollectionError } from "./components/CollectionError";
import { CollectionFilter } from "./components/CollectionFilter";
import { CollectionList } from "./components/CollectionList";
import { CollectionLoading } from "./components/CollectionLoading";

export default function CollectionScreen() {
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

    // Derived states
    const isPageLoading = isMyCardLoading || isLoading;
    const pageError = myCardError || error;
    const isEmpty = filteredCards.length === 0;
    const hasCards = allCards.length > 0;

    // Handlers
    const handleRetry = () => window.location.reload();

    // Render content based on state
    const renderContent = () => {
        if (isPageLoading) {
            return <CollectionLoading />;
        }

        if (pageError) {
            return <CollectionError error={pageError} onRetry={handleRetry} />;
        }

        if (isEmpty) {
            return <CollectionEmpty hasCards={hasCards} />;
        }

        return <CollectionList cards={filteredCards} />;
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex gap-x-2 h-12 mb-5 items-center">
                <BackButton className="relative top-0 left-0" />
                <div className="text-3xl font-k2d font-bold text-black">
                    My Collection
                </div>
            </div>

            {/* Content */}
            <CollectionFilter
                tags={tags}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
            />
            <div className="space-y-4 mt-5">{renderContent()}</div>
        </div>
    );
}
