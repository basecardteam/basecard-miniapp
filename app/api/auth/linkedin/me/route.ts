import { NextRequest, NextResponse } from "next/server";

const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Missing authorization header" },
                { status: 401 },
            );
        }

        const response = await fetch(LINKEDIN_USERINFO_URL, {
            headers: {
                Authorization: authHeader,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[LinkedIn Me] Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[LinkedIn Me] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
