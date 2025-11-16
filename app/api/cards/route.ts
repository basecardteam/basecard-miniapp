import { cards } from "@/db/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/cards
export async function GET(_: Request) {
    try {
        const allCards = await db.select().from(cards).orderBy(desc(cards.id));
        return NextResponse.json(allCards);
    } catch (error) {
        console.error("Error fetching cards:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

// POST /api/cards - Create new card
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            nickname,
            bio,
            imageURI,
            profileImage,
            basename,
            role,
            skills,
            address,
        } = body;

        // Validate required fields
        if (!address) {
            return NextResponse.json(
                { message: "Address is required" },
                { status: 400 }
            );
        }

        const newCard = await db
            .insert(cards)
            .values({
                nickname,
                bio,
                imageURI,
                profileImage, // 원본 프로필 이미지 저장
                basename,
                role,
                skills,
                address,
            })
            .returning();

        return NextResponse.json(newCard[0], { status: 201 });
    } catch (error) {
        console.error("Error creating card:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
