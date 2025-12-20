"use client";

import {
    AuthResponse,
    AuthUser,
    generateSignInMessage,
    loginWithFarcaster,
    loginWithWallet,
} from "@/lib/api/auth";
import { logger } from "@/lib/common/logger";
import { sdk } from "@farcaster/miniapp-sdk";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useFrameContext } from "./FrameProvider";

interface AuthContextType {
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    authUser: AuthUser | null;
    accessToken: string | null;
    loginWithMetaMask: (connectedAddress?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const AUTH_TOKEN_KEY = "basecard_auth_token";
const AUTH_USER_KEY = "basecard_auth_user";
const AUTH_EXPIRES_KEY = "basecard_auth_expires";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(AUTH_EXPIRES_KEY);
    if (!expiresAt) return true;

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Token is expired or will expire within buffer time
    return now >= expiryTime - TOKEN_REFRESH_BUFFER_MS;
}

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const isRefreshing = useRef(false);

    const frameContext = useFrameContext();
    const isInMiniApp = frameContext?.isInMiniApp ?? false;

    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    // Save auth state to localStorage with expiry
    const saveAuthState = useCallback((response: AuthResponse) => {
        // Debug: log the full response to see what backend returns
        logger.debug(
            "Auth response received:",
            JSON.stringify(response, null, 2)
        );

        // Validate accessToken before saving
        if (!response.accessToken || typeof response.accessToken !== "string") {
            logger.error(
                "Invalid accessToken in response:",
                response.accessToken
            );
            throw new Error("Invalid accessToken received from server");
        }

        const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

        setAccessToken(response.accessToken);
        setAuthUser(response.user);
        setIsAuthenticated(true);

        localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt.toString());

        logger.debug(
            "Auth state saved, expires at:",
            new Date(expiresAt).toISOString()
        );
    }, []);

    // Clear auth state
    const logout = useCallback(() => {
        setAccessToken(null);
        setAuthUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_EXPIRES_KEY);
    }, []);

    // Farcaster re-auth
    const refreshFarcasterAuth = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;

        try {
            logger.debug("Refreshing Farcaster auth token...");
            const { token } = await sdk.quickAuth.getToken();
            const response = await loginWithFarcaster(token);
            saveAuthState(response);
            logger.debug("Farcaster auth token refreshed");
        } catch (error) {
            logger.error("Farcaster auth refresh failed:", error);
            logout();
        } finally {
            isRefreshing.current = false;
        }
    }, [saveAuthState, logout]);

    // MetaMask re-auth
    const refreshMetaMaskAuth = useCallback(async () => {
        if (isRefreshing.current || !address) return;
        isRefreshing.current = true;

        try {
            logger.debug("Refreshing MetaMask auth token...");
            const message = generateSignInMessage(address);
            const signature = await signMessageAsync({ message });
            const response = await loginWithWallet(address, message, signature);
            saveAuthState(response);
            logger.debug("MetaMask auth token refreshed");
        } catch (error) {
            logger.error("MetaMask auth refresh failed:", error);
            logout();
        } finally {
            isRefreshing.current = false;
        }
    }, [address, signMessageAsync, saveAuthState, logout]);

    // Restore auth state from localStorage (check expiry)
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser && !isTokenExpired()) {
            try {
                setAccessToken(storedToken);
                setAuthUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                logger.debug("Restored auth from localStorage (token valid)");
            } catch {
                logout();
            }
        } else if (storedToken) {
            // Token exists but expired - clear it
            logger.debug("Stored token expired, clearing...");
            logout();
        }
        setIsAuthLoading(false);
    }, [logout]);

    // Periodic token expiry check (every minute)
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkAndRefresh = () => {
            if (isTokenExpired()) {
                logger.debug("Token expired or expiring soon, refreshing...");
                if (isInMiniApp) {
                    refreshFarcasterAuth();
                } else if (isConnected && address) {
                    refreshMetaMaskAuth();
                }
            }
        };

        // Check immediately
        checkAndRefresh();

        // Check every minute
        const interval = setInterval(checkAndRefresh, 60 * 1000);
        return () => clearInterval(interval);
    }, [
        isAuthenticated,
        isInMiniApp,
        isConnected,
        address,
        refreshFarcasterAuth,
        refreshMetaMaskAuth,
    ]);

    // Farcaster Quick Auth flow (auto-login in miniapp)
    useEffect(() => {
        if (!isInMiniApp || isAuthenticated) {
            return;
        }

        const loginFarcaster = async () => {
            try {
                setIsAuthLoading(true);
                logger.debug("Attempting Farcaster Quick Auth login...");

                const { token } = await sdk.quickAuth.getToken();
                const response = await loginWithFarcaster(token);

                saveAuthState(response);
                logger.debug(
                    "Farcaster Quick Auth login successful",
                    response.user
                );
            } catch (error) {
                logger.error("Farcaster Quick Auth login failed:", error);
            } finally {
                setIsAuthLoading(false);
            }
        };

        loginFarcaster();
    }, [isInMiniApp, isAuthenticated, saveAuthState]);

    // MetaMask login (manual trigger)
    // connectedAddress is optional - use it when calling right after connectAsync
    // because React state (address) may not be updated yet
    const loginWithMetaMask = useCallback(
        async (connectedAddress?: string) => {
            const walletAddress = connectedAddress || address;
            logger.debug("Attempting MetaMask login...", { walletAddress });

            if (!walletAddress) {
                throw new Error("Wallet not connected");
            }

            try {
                setIsAuthLoading(true);

                const message = generateSignInMessage(walletAddress);
                const signature = await signMessageAsync({ message });

                const response = await loginWithWallet(
                    walletAddress,
                    message,
                    signature
                );

                saveAuthState(response);
                logger.debug("MetaMask login successful", response.user);
            } catch (error) {
                logger.error("MetaMask login failed:", error);
                throw error;
            } finally {
                setIsAuthLoading(false);
            }
        },
        [address, signMessageAsync, saveAuthState]
    );

    // Browser wallet auto-login: if wallet is already connected but not authenticated
    useEffect(() => {
        // Skip if in miniapp (Farcaster auth handles that)
        if (isInMiniApp) return;
        // Skip if already authenticated or still loading
        if (isAuthenticated || isAuthLoading) return;
        // Skip if wallet not connected
        if (!isConnected || !address) return;

        // Add delay to allow React state to stabilize and prevent duplicate requests
        const timeoutId = setTimeout(() => {
            logger.debug(
                "Wallet connected, triggering auto-login after delay..."
            );
            loginWithMetaMask(address).catch((error) => {
                logger.error("Auto-login failed:", error);
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [
        isInMiniApp,
        isAuthenticated,
        isAuthLoading,
        isConnected,
        address,
        loginWithMetaMask,
    ]);

    const contextValue: AuthContextType = {
        isAuthenticated,
        isAuthLoading,
        authUser,
        accessToken,
        loginWithMetaMask,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
