import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, redirect_uri, client_id } = body;

        if (!code || !redirect_uri || !client_id) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 },
            );
        }

        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (!clientSecret) {
            return NextResponse.json(
                { error: "GitHub client secret not configured" },
                { status: 500 },
            );
        }

        const params = new URLSearchParams({
            client_id,
            client_secret: clientSecret,
            code,
            redirect_uri,
        });

        const response = await fetch(GITHUB_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (data.error) {
            console.error("[GitHub Token] Error:", data);
            return NextResponse.json(data, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[GitHub Token] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
