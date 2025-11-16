import CardItem from "@/components/main/collections/CardItem";
import { Card } from "@/lib/types";

interface CollectionListProps {
    cards: Card[];
}

export function CollectionList({ cards }: CollectionListProps) {
    if (cards.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-y-5">
            {cards.map((card) => (
                <CardItem
                    key={card.id}
                    isActive={true}
                    card={card}
                />
            ))}
        </div>
    );
}

