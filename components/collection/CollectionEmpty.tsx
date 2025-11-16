interface CollectionEmptyProps {
    hasCards: boolean;
}

export function CollectionEmpty({ hasCards }: CollectionEmptyProps) {
    return (
        <div className="text-center py-8">
            <p className="text-gray-500 font-k2d-regular">
                {hasCards
                    ? "No cards match your search"
                    : "No cards collected yet"}
            </p>
        </div>
    );
}

