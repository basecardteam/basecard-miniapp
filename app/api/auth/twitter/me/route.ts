import { NextRequest, NextResponse } from "next/server";

const TWITTER_ME_URL = "https://api.twitter.com/2/users/me";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Missing authorization header" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${TWITTER_ME_URL}?user.fields=profile_image_url`,
            {
                headers: {
                    Authorization: authHeader,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("[Twitter Me] Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Twitter Me] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
