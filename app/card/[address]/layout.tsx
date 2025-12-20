import { fetchCardByAddress } from "@/lib/api/basecards";
import { resolveIpfsUrl } from "@/lib/utils";
import { Metadata } from "next";

interface CardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ address: string }>;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ address: string }>;
}): Promise<Metadata> {
    const { address } = await params;

    try {
        const card = await fetchCardByAddress(address);

        if (!card) {
            return {
                title: "Card Not Found - BaseCard",
                description: "This BaseCard does not exist.",
            };
        }

        const imageUrl = card.imageUri ? resolveIpfsUrl(card.imageUri) : null;
        const title = card.nickname
            ? `${card.nickname}'s BaseCard`
            : "BaseCard";
        const description =
            card.bio || `Check out this builder's BaseCard profile!`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: imageUrl ? [imageUrl] : [],
                type: "profile",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: imageUrl ? [imageUrl] : [],
            },
            other: {
                "fc:frame": "vNext",
                "fc:frame:image": imageUrl || "",
                "fc:frame:button:1": "View Card",
                "fc:frame:button:1:action": "link",
                "fc:frame:button:1:target": `${
                    process.env.NEXT_PUBLIC_URL || "https://basecard.vercel.app"
                }/card/${address}`,
            },
        };
    } catch (error) {
        console.error("Failed to generate metadata:", error);
        return {
            title: "BaseCard",
            description: "Builder Identity on Base",
        };
    }
}

export default async function CardLayout({ children }: CardLayoutProps) {
    return <>{children}</>;
}
