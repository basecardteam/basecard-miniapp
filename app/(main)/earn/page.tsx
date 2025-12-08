import EarnScreen from "@/features/earn/EarnScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Earn - BaseCard",
    description: "Earn rewards with BaseCard.",
};

export default function EarnPage() {
    return <EarnScreen />;
}
