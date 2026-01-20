import { NextRequest, NextResponse } from "next/server";

const GITHUB_USER_URL = "https://api.github.com/user";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Missing authorization header" },
                { status: 401 },
            );
        }

        const response = await fetch(GITHUB_USER_URL, {
            headers: {
                Authorization: authHeader,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[GitHub Me] Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[GitHub Me] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
