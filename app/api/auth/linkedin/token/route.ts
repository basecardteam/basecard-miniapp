import { NextRequest, NextResponse } from "next/server";

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

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

        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        if (!clientSecret) {
            return NextResponse.json(
                { error: "LinkedIn client secret not configured" },
                { status: 500 },
            );
        }

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri,
            client_id,
            client_secret: clientSecret,
        });

        const response = await fetch(LINKEDIN_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[LinkedIn Token] Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[LinkedIn Token] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
