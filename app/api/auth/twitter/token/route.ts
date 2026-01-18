import { NextRequest, NextResponse } from "next/server";

const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, code_verifier, redirect_uri, client_id } = body;

        if (!code || !code_verifier || !redirect_uri || !client_id) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri,
            code_verifier,
        });

        // Client Secret이 있으면 Basic Auth 사용, 없으면 PKCE only (Public client)
        const clientSecret = process.env.TWITTER_CLIENT_SECRET;
        const headers: Record<string, string> = {
            "Content-Type": "application/x-www-form-urlencoded",
        };

        if (clientSecret) {
            // Confidential client: Basic Auth 필요
            const credentials = Buffer.from(`${client_id}:${clientSecret}`).toString("base64");
            headers["Authorization"] = `Basic ${credentials}`;
        } else {
            // Public client: client_id를 body에 포함
            params.set("client_id", client_id);
        }

        const response = await fetch(TWITTER_TOKEN_URL, {
            method: "POST",
            headers,
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Twitter Token] Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Twitter Token] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
