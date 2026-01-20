/**
 * LinkedIn OAuth 2.0 서비스 (프론트엔드 직접 호출)
 */

// ============ Constants ============

const LINKEDIN_API = {
    AUTHORIZE: "https://www.linkedin.com/oauth/v2/authorization",
    TOKEN: "https://www.linkedin.com/oauth/v2/accessToken",
    USERINFO: "https://api.linkedin.com/v2/userinfo",
} as const;

// 환경에 따라 동적으로 redirect URI 설정
function getRedirectUri(): string {
    if (typeof window === "undefined") {
        return "https://miniapp.basecardteam.org/linkedin/callback";
    }
    return `${window.location.origin}/linkedin/callback`;
}

// ============ Types ============

export interface LinkedInOAuthConfig {
    clientId: string;
    redirectUri: string;
    scopes: string;
}

export interface LinkedInOAuthState {
    state: string;
    returnUrl?: string;
}

export interface LinkedInTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope?: string;
    token_expires_at?: number;
}

export interface LinkedInUser {
    sub: string; // LinkedIn member ID
    name: string;
    given_name: string;
    family_name: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
}

// ============ Storage Keys ============

const STORAGE_KEYS = {
    TOKENS: "linkedin_oauth_tokens",
    OAUTH_STATE: "linkedin_oauth_state",
} as const;

// ============ Storage Functions ============

export function getStoredTokens(): LinkedInTokenResponse | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return stored ? JSON.parse(stored) : null;
}

export function saveTokens(
    tokens: Omit<LinkedInTokenResponse, "token_expires_at">,
): void {
    const tokenExpiresAt = Date.now() + Number(tokens.expires_in) * 1000;
    const tokensToSave: LinkedInTokenResponse = {
        ...tokens,
        token_expires_at: tokenExpiresAt,
    };
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokensToSave));
}

export function clearStoredTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
}

export function saveOAuthState(state: LinkedInOAuthState): void {
    localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, JSON.stringify(state));
}

export function getOAuthState(): LinkedInOAuthState | null {
    const stored = localStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    return stored ? JSON.parse(stored) : null;
}

export function clearOAuthState(): void {
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
}

// ============ State Generation ============

function generateRandomString(length: number): string {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        randomString += charset[randomValues[i] % charset.length];
    }

    return randomString;
}

export function generateState(): string {
    return generateRandomString(32);
}

// ============ OAuth Config ============

export function getOAuthConfig(): LinkedInOAuthConfig {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "";

    if (!clientId) {
        throw new Error(
            "NEXT_PUBLIC_LINKEDIN_CLIENT_ID 환경 변수가 설정되지 않았습니다.",
        );
    }

    return {
        clientId,
        redirectUri: getRedirectUri(),
        scopes: "openid profile email",
    };
}

// ============ Auth URL Generation ============

export function generateAuthUrl(
    config: LinkedInOAuthConfig,
    state: string,
): string {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes,
        state: state,
    });

    return `${LINKEDIN_API.AUTHORIZE}?${params.toString()}`;
}

// ============ Token Exchange (via API Route proxy) ============

export async function exchangeCodeForToken(
    code: string,
    redirectUri: string,
    clientId: string,
): Promise<LinkedInTokenResponse> {
    const response = await fetch("/api/auth/linkedin/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[LinkedIn OAuth] Token exchange failed:", error);
        throw new Error(error.error_description || "토큰 교환에 실패했습니다.");
    }

    return response.json();
}

// ============ Get LinkedIn User (via API Route proxy) ============

export async function getLinkedInUser(
    accessToken: string,
): Promise<LinkedInUser> {
    const response = await fetch("/api/auth/linkedin/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[LinkedIn OAuth] Get user failed:", error);
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
    }

    return response.json();
}

// ============ Token Validity ============

export function isTokenValid(): boolean {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.token_expires_at) return false;

    // 5분 여유를 두고 만료 체크
    return Date.now() < tokens.token_expires_at - 5 * 60 * 1000;
}

// ============ Get Current User ============

export async function getCurrentLinkedInUser(): Promise<LinkedInUser | null> {
    const tokens = getStoredTokens();
    if (!tokens || !isTokenValid()) {
        return null;
    }

    try {
        return await getLinkedInUser(tokens.access_token);
    } catch {
        return null;
    }
}
