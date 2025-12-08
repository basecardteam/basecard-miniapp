import QuestScreen from "@/features/quest/QuestScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quest - BaseCard",
    description: "Complete quests and earn rewards.",
};

export default function QuestPage() {
    return <QuestScreen />;
}
