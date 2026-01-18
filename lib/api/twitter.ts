/**
 * Twitter OAuth 2.0 PKCE 서비스 (프론트엔드 직접 호출)
 */

// ============ Constants ============

const TWITTER_API = {
    AUTHORIZE: "https://twitter.com/i/oauth2/authorize",
    TOKEN: "https://api.twitter.com/2/oauth2/token",
    ME: "https://api.twitter.com/2/users/me",
} as const;

// 환경에 따라 동적으로 redirect URI 설정
function getRedirectUri(): string {
    if (typeof window === "undefined") {
        return "https://miniapp.basecardteam.org/twitter/callback";
    }
    return `${window.location.origin}/twitter/callback`;
}

// ============ Types ============

export interface PKCEParams {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: "S256";
}

export interface TwitterOAuthConfig {
    clientId: string;
    redirectUri: string;
    scopes: string;
}

export interface TwitterOAuthState {
    codeVerifier: string;
    state: string;
}

export interface TwitterTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
    token_expires_at?: number;
}

export interface TwitterUser {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
}

// ============ Storage Keys ============

const STORAGE_KEYS = {
    TOKENS: "twitter_oauth_tokens",
    OAUTH_STATE: "twitter_oauth_state",
} as const;

// ============ Storage Functions ============

export function getStoredTokens(): TwitterTokenResponse | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return stored ? JSON.parse(stored) : null;
}

export function saveTokens(
    tokens: Omit<TwitterTokenResponse, "token_expires_at">
): void {
    const tokenExpiresAt = Date.now() + Number(tokens.expires_in) * 1000;
    const tokensToSave: TwitterTokenResponse = {
        ...tokens,
        token_expires_at: tokenExpiresAt,
    };
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokensToSave));
}

export function clearStoredTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
}

export function saveOAuthState(state: TwitterOAuthState): void {
    // 모바일에서 새 탭으로 열릴 때도 접근 가능하도록 localStorage 사용
    localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, JSON.stringify(state));
}

export function getOAuthState(): TwitterOAuthState | null {
    const stored = localStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    return stored ? JSON.parse(stored) : null;
}

export function clearOAuthState(): void {
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
}

// ============ PKCE Functions ============

function generateRandomString(length: number): string {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let randomString = "";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        randomString += charset[randomValues[i] % charset.length];
    }

    return randomString;
}

function base64UrlEncode(bytes: number[]): string {
    const binary = bytes.map((b) => String.fromCharCode(b)).join("");
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generatePKCE(): Promise<PKCEParams> {
    const codeVerifier = generateRandomString(128);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeChallenge = base64UrlEncode(hashArray);

    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: "S256",
    };
}

export function generateState(): string {
    return generateRandomString(32);
}

// ============ OAuth Config ============

export function getOAuthConfig(): TwitterOAuthConfig {
    const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "";

    if (!clientId) {
        throw new Error("NEXT_PUBLIC_TWITTER_CLIENT_ID 환경 변수가 설정되지 않았습니다.");
    }

    return {
        clientId,
        redirectUri: getRedirectUri(),
        scopes: "tweet.read users.read offline.access",
    };
}

// ============ Auth URL Generation ============

export function generateAuthUrl(
    config: TwitterOAuthConfig,
    pkceParams: PKCEParams,
    state: string
): string {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes,
        state: state,
        code_challenge: pkceParams.codeChallenge,
        code_challenge_method: pkceParams.codeChallengeMethod,
    });

    return `${TWITTER_API.AUTHORIZE}?${params.toString()}`;
}

// ============ Token Exchange (via API Route proxy) ============

export async function exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    clientId: string
): Promise<TwitterTokenResponse> {
    const response = await fetch("/api/auth/twitter/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
            client_id: clientId,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[Twitter OAuth] Token exchange failed:", error);
        throw new Error(error.error_description || "토큰 교환에 실패했습니다.");
    }

    return response.json();
}

// ============ Get Twitter User (via API Route proxy) ============

export async function getTwitterUser(
    accessToken: string
): Promise<TwitterUser> {
    const response = await fetch("/api/auth/twitter/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[Twitter OAuth] Get user failed:", error);
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
    }

    const data = await response.json();
    return data.data;
}

// ============ Popup OAuth Flow ============

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;

function openPopup(url: string): Window | null {
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

    return window.open(
        url,
        "twitter-oauth",
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`
    );
}

export interface TwitterOAuthResult {
    success: boolean;
    user?: TwitterUser;
    error?: string;
}

/**
 * Twitter OAuth 플로우 시작 (팝업 방식)
 */
export async function startTwitterOAuth(): Promise<TwitterOAuthResult> {
    try {
        // 1. PKCE 파라미터 생성
        const config = getOAuthConfig();
        const pkceParams = await generatePKCE();
        const state = generateState();

        // 2. OAuth state 저장 (콜백에서 검증용)
        saveOAuthState({
            codeVerifier: pkceParams.codeVerifier,
            state,
        });

        // 3. 인증 URL 생성 및 팝업 열기
        const authUrl = generateAuthUrl(config, pkceParams, state);
        const popup = openPopup(authUrl);

        if (!popup) {
            throw new Error("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
        }

        // 4. 팝업에서 콜백 대기
        const result = await waitForOAuthCallback(popup, config.redirectUri);

        // 5. OAuth state 검증
        const savedState = getOAuthState();
        if (!savedState || savedState.state !== result.state) {
            throw new Error("OAuth state가 일치하지 않습니다.");
        }

        // 6. 토큰 교환
        const tokens = await exchangeCodeForToken(
            result.code,
            savedState.codeVerifier,
            config.redirectUri,
            config.clientId
        );

        // 7. 토큰 저장
        saveTokens(tokens);

        // 8. 사용자 정보 가져오기
        const user = await getTwitterUser(tokens.access_token);

        // 9. 정리
        clearOAuthState();

        return { success: true, user };
    } catch (error) {
        clearOAuthState();
        return {
            success: false,
            error: error instanceof Error ? error.message : "인증에 실패했습니다.",
        };
    }
}

/**
 * 팝업에서 OAuth 콜백 대기
 */
function waitForOAuthCallback(
    popup: Window,
    redirectUri: string
): Promise<{ code: string; state: string }> {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            try {
                // 팝업이 닫혔는지 확인
                if (popup.closed) {
                    clearInterval(checkInterval);
                    reject(new Error("인증이 취소되었습니다."));
                    return;
                }

                // 팝업 URL 확인 (같은 origin으로 리다이렉트되면 접근 가능)
                const popupUrl = popup.location.href;

                if (popupUrl.startsWith(redirectUri)) {
                    clearInterval(checkInterval);
                    popup.close();

                    const url = new URL(popupUrl);
                    const code = url.searchParams.get("code");
                    const state = url.searchParams.get("state");
                    const error = url.searchParams.get("error");

                    if (error) {
                        reject(new Error(error));
                        return;
                    }

                    if (!code || !state) {
                        reject(new Error("인증 코드를 받지 못했습니다."));
                        return;
                    }

                    resolve({ code, state });
                }
            } catch {
                // Cross-origin 접근 에러는 무시 (아직 리다이렉트 안됨)
            }
        }, 500);

        // 5분 타임아웃
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!popup.closed) {
                popup.close();
            }
            reject(new Error("인증 시간이 초과되었습니다."));
        }, 5 * 60 * 1000);
    });
}

/**
 * 토큰 유효성 검사
 */
export function isTokenValid(): boolean {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.token_expires_at) return false;

    // 5분 여유를 두고 만료 체크
    return Date.now() < tokens.token_expires_at - 5 * 60 * 1000;
}

/**
 * 현재 연결된 Twitter 사용자 정보 가져오기
 */
export async function getCurrentTwitterUser(): Promise<TwitterUser | null> {
    const tokens = getStoredTokens();
    if (!tokens || !isTokenValid()) {
        return null;
    }

    try {
        return await getTwitterUser(tokens.access_token);
    } catch {
        return null;
    }
}
