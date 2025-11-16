import { cards } from "@/db/schema";
import { db } from "@/lib/db";
import { MOCK_CARD, MOCK_WALLET_ADDRESS, USE_MOCK_DATA } from "@/lib/mockData";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/card/[address] - Get card by address
export async function GET(
    _: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        // 목업 모드일 때 목업 데이터 반환
        if (USE_MOCK_DATA && address.toLowerCase() === MOCK_WALLET_ADDRESS.toLowerCase()) {
            return NextResponse.json(MOCK_CARD);
        }

        const card = await db.query.cards.findFirst({
            where: (cards, { eq }) => eq(cards.address, address),
        });

        if (!card) {
            return NextResponse.json(
                { message: "Card not found" },
                { status: 404 }
            );
        }

        // card 객체를 그대로 반환 (tokenId 포함)
        // 클라이언트에서 바로 사용할 수 있도록 구조화
        return NextResponse.json(card);
    } catch (error) {
        console.error("Error fetching card:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

// PUT /api/card/[address] - Update card by address
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;
        const body = await req.json();
        const {
            nickname,
            bio,
            imageURI,
            profileImage,
            basename,
            role,
            skills,
            tokenId,
        } = body;

        // Check if card exists
        const existingCard = await db
            .select()
            .from(cards)
            .where(eq(cards.address, address));

        if (existingCard.length === 0) {
            return NextResponse.json(
                { message: "Card not found" },
                { status: 404 }
            );
        }

        // Update card
        const updateData: {
            nickname?: string;
            bio?: string;
            imageURI?: string;
            profileImage?: string;
            basename?: string;
            role?: string;
            skills?: string[];
            tokenId?: number;
        } = {};

        if (nickname !== undefined) updateData.nickname = nickname;
        if (bio !== undefined) updateData.bio = bio;
        if (imageURI !== undefined) updateData.imageURI = imageURI;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (basename !== undefined) updateData.basename = basename;
        if (role !== undefined) updateData.role = role;
        if (skills !== undefined) updateData.skills = skills;
        if (tokenId !== undefined) updateData.tokenId = tokenId;

        const updatedCard = await db
            .update(cards)
            .set(updateData)
            .where(eq(cards.address, address))
            .returning();

        return NextResponse.json(updatedCard[0]);
    } catch (error) {
        console.error("Error updating card:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

// DELETE /api/card/[address] - Delete card by address
export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        // Check if card exists
        const existingCard = await db
            .select()
            .from(cards)
            .where(eq(cards.address, address));

        if (existingCard.length === 0) {
            return NextResponse.json(
                { success: false, message: "Card not found" },
                { status: 404 }
            );
        }

        // Delete card
        await db.delete(cards).where(eq(cards.address, address));

        return NextResponse.json({
            success: true,
            message: "Card deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting card:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
