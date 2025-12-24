import { fetchBaseCardById } from "@/lib/api/basecards";
import { constructMetadata } from "@/lib/metadata";
import { resolveIpfsUrl } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const card = await fetchBaseCardById(id);

    if (!card) return constructMetadata();

    const displayName = card.nickname || "BaseCard User";
    const role = card.role || "Builder";
    const description = card.bio || `${displayName} is a ${role} on BaseCard`;

    return constructMetadata({
        title: displayName,
        description,
        path: `/share/${id}`, // Deep link back to this share page
        imageUrl: resolveIpfsUrl(card.imageUri),
        frameButtonTitle: "Mint my BaseCard",
    });
}

export default function SharePage() {
    redirect("/");
}
