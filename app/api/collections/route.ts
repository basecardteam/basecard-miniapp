import { cards, collections } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/collections?id=card_id - Get collections for a specific card
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");

    try {
        if (!cardId) {
            return NextResponse.json(
                { message: "Card ID is required" },
                { status: 400 }
            );
        }

        // Get all collections for the specified card
        const userCollections = await db
            .select({
                id: collections.id,
                cardId: collections.cardId,
                collectedCardId: collections.collectedCardId,
                collectedCard: {
                    id: cards.id,
                    nickname: cards.nickname,
                    bio: cards.bio,
                    imageURI: cards.imageURI,
                    basename: cards.basename,
                    role: cards.role,
                    skills: cards.skills,
                    address: cards.address,
                },
            })
            .from(collections)
            .innerJoin(cards, eq(collections.collectedCardId, cards.id))
            .where(eq(collections.cardId, parseInt(cardId)));

        const collectionsWithTokenId = await Promise.all(
            userCollections.map(async (collection) => {
                const [{ count }] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(cards)
                    .where(lte(cards.id, collection.collectedCard.id));

                return {
                    ...collection,
                    collectedCard: {
                        ...collection.collectedCard,
                        tokenId: count,
                    },
                };
            })
        );

        return NextResponse.json(collectionsWithTokenId);
    } catch (error) {
        console.error("Error fetching collections:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

// POST /api/collections - Add a new collection
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cardId, collectCardId } = body;

        // Validate required fields
        if (!cardId || !collectCardId) {
            return NextResponse.json(
                {
                    message: "Both cardId and collectCardId are required",
                },
                { status: 400 }
            );
        }

        // Check if both cards exist
        const [ownerCard, collectedCard] = await Promise.all([
            db.select().from(cards).where(eq(cards.id, cardId)),
            db.select().from(cards).where(eq(cards.id, collectCardId)),
        ]);

        if (ownerCard.length === 0) {
            return NextResponse.json(
                { message: "Owner card not found" },
                { status: 404 }
            );
        }

        if (collectedCard.length === 0) {
            return NextResponse.json(
                { message: "Collected card not found" },
                { status: 404 }
            );
        }

        // Check if collection already exists
        const existingCollection = await db
            .select()
            .from(collections)
            .where(
                and(
                    eq(collections.cardId, parseInt(cardId)),
                    eq(collections.collectedCardId, parseInt(collectCardId))
                )
            );

        if (existingCollection.length > 0) {
            return NextResponse.json(
                { message: "Collection already exists" },
                { status: 409 }
            );
        }

        // Create new collection
        const newCollection = await db
            .insert(collections)
            .values({
                cardId: parseInt(cardId),
                collectedCardId: parseInt(collectCardId),
            })
            .returning();

        return NextResponse.json(newCollection[0], { status: 201 });
    } catch (error) {
        console.error("Error creating collection:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
