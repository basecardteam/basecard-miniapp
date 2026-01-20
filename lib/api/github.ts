/**
 * GitHub OAuth 2.0 서비스 (프론트엔드 직접 호출)
 */

// ============ Constants ============

const GITHUB_API = {
    AUTHORIZE: "https://github.com/login/oauth/authorize",
    TOKEN: "https://github.com/login/oauth/access_token",
    USER: "https://api.github.com/user",
} as const;

// 환경에 따라 동적으로 redirect URI 설정
function getRedirectUri(): string {
    if (typeof window === "undefined") {
        return "https://miniapp.basecardteam.org/github/callback";
    }
    return `${window.location.origin}/github/callback`;
}

// ============ Types ============

export interface GitHubOAuthConfig {
    clientId: string;
    redirectUri: string;
    scopes: string;
}

export interface GitHubOAuthState {
    state: string;
    returnUrl?: string;
}

export interface GitHubTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

export interface GitHubUser {
    id: number;
    login: string; // username
    name: string | null;
    avatar_url: string;
}

// ============ Storage Keys ============

const STORAGE_KEYS = {
    TOKENS: "github_oauth_tokens",
    OAUTH_STATE: "github_oauth_state",
} as const;

// ============ Storage Functions ============

export function getStoredTokens(): GitHubTokenResponse | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return stored ? JSON.parse(stored) : null;
}

export function saveTokens(tokens: GitHubTokenResponse): void {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

export function clearStoredTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
}

export function saveOAuthState(state: GitHubOAuthState): void {
    localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, JSON.stringify(state));
}

export function getOAuthState(): GitHubOAuthState | null {
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

export function getOAuthConfig(): GitHubOAuthConfig {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";

    if (!clientId) {
        throw new Error(
            "NEXT_PUBLIC_GITHUB_CLIENT_ID 환경 변수가 설정되지 않았습니다.",
        );
    }

    return {
        clientId,
        redirectUri: getRedirectUri(),
        scopes: "read:user",
    };
}

// ============ Auth URL Generation ============

export function generateAuthUrl(
    config: GitHubOAuthConfig,
    state: string,
): string {
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes,
        state: state,
    });

    return `${GITHUB_API.AUTHORIZE}?${params.toString()}`;
}

// ============ Token Exchange (via API Route proxy) ============

export async function exchangeCodeForToken(
    code: string,
    redirectUri: string,
    clientId: string,
): Promise<GitHubTokenResponse> {
    const response = await fetch("/api/auth/github/token", {
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
        console.error("[GitHub OAuth] Token exchange failed:", error);
        throw new Error(error.error_description || "토큰 교환에 실패했습니다.");
    }

    return response.json();
}

// ============ Get GitHub User (via API Route proxy) ============

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch("/api/auth/github/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[GitHub OAuth] Get user failed:", error);
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
    }

    return response.json();
}

// ============ Get Current User ============

export async function getCurrentGitHubUser(): Promise<GitHubUser | null> {
    const tokens = getStoredTokens();
    if (!tokens) {
        return null;
    }

    try {
        return await getGitHubUser(tokens.access_token);
    } catch {
        return null;
    }
}
