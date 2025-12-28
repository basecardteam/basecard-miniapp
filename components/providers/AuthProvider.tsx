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
    useMemo,
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
    refreshAuth: () => Promise<void>;
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
const NOTIFICATION_PROMPT_SHOWN_KEY = "basecard_notification_prompt_shown";
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
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [retryCountdown, setRetryCountdown] = useState(0);
    const isAuthInProgress = useRef(false);
    const hasAttemptedAutoLogin = useRef(false);
    const hasRestoredAuth = useRef(false);

    // Refs to store latest function references (prevents useEffect re-runs)
    const performFarcasterAuthRef = useRef<
        ((isInitialLogin?: boolean) => Promise<void>) | null
    >(null);
    const performMetaMaskAuthRef = useRef<
        | ((walletAddress: string, isInitialLogin?: boolean) => Promise<void>)
        | null
    >(null);

    const frameContext = useFrameContext();
    const isInMiniApp = frameContext?.isInMiniApp ?? false;
    const isContextReady = frameContext?.isContextReady ?? false;

    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    // Save auth state to localStorage with expiry
    const saveAuthState = useCallback((response: AuthResponse) => {
        logger.debug(
            "Auth response received:",
            JSON.stringify(response, null, 2)
        );

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
        hasAttemptedAutoLogin.current = false; // Allow auto-login on next connect
        hasRestoredAuth.current = false; // Allow restore on next session
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_EXPIRES_KEY);
    }, []);

    // Unified Farcaster auth (for both initial login and refresh)
    const performFarcasterAuth = useCallback(
        async (isInitialLogin: boolean = false) => {
            if (isAuthInProgress.current) return;
            isAuthInProgress.current = true;

            if (isInitialLogin) {
                setIsAuthLoading(true);
            }

            try {
                logger.info(
                    isInitialLogin
                        ? "Attempting Farcaster Quick Auth login..."
                        : "Refreshing Farcaster auth token..."
                );

                const { token } = await sdk.quickAuth.getToken();
                const clientFid = (
                    frameContext?.context as { client?: { clientFid?: number } }
                )?.client?.clientFid;

                logger.info("[Farcaster Auth] Preparing login request:", {
                    hasToken: !!token,
                    clientFid,
                    address,
                    frameContext: frameContext?.context,
                });

                const response = await loginWithFarcaster(
                    token,
                    clientFid!,
                    address!
                );
                saveAuthState(response);

                logger.info(
                    isInitialLogin
                        ? "Farcaster Quick Auth login successful"
                        : "Farcaster auth token refreshed",
                    response.user
                );
            } catch (error) {
                // Log detailed error info
                const errorDetails =
                    error instanceof Error
                        ? {
                              message: error.message,
                              name: error.name,
                              stack: error.stack,
                          }
                        : {
                              raw: String(error),
                              typeof: typeof error,
                              json: JSON.stringify(error),
                          };

                logger.error(
                    isInitialLogin
                        ? "Farcaster Quick Auth login failed:"
                        : "Farcaster auth refresh failed:",
                    errorDetails
                );
                if (!isInitialLogin) {
                    logout(); // Only logout on refresh failure
                }
            } finally {
                isAuthInProgress.current = false;
                if (isInitialLogin) {
                    setIsAuthLoading(false);
                }
            }
        },
        [saveAuthState, logout, frameContext, address]
    );

    // Unified MetaMask auth (for both initial login and refresh)
    const performMetaMaskAuth = useCallback(
        async (walletAddress: string, isInitialLogin: boolean = false) => {
            if (isAuthInProgress.current) return;
            isAuthInProgress.current = true;

            if (isInitialLogin) {
                setIsAuthLoading(true);
            }

            try {
                logger.debug(
                    isInitialLogin
                        ? "Attempting MetaMask login..."
                        : "Refreshing MetaMask auth token...",
                    { walletAddress }
                );

                const message = generateSignInMessage(walletAddress);
                const signature = await signMessageAsync({ message });
                const response = await loginWithWallet(
                    walletAddress,
                    message,
                    signature
                );
                saveAuthState(response);

                logger.debug(
                    isInitialLogin
                        ? "MetaMask login successful"
                        : "MetaMask auth token refreshed",
                    response.user
                );
            } catch (error) {
                logger.error(
                    isInitialLogin
                        ? "MetaMask login failed:"
                        : "MetaMask auth refresh failed:",
                    error
                );
                if (!isInitialLogin) {
                    logout(); // Only logout on refresh failure
                }
                if (isInitialLogin) {
                    // Check if user rejected
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    const isRejected =
                        errorMessage.toLowerCase().includes("user rejected") ||
                        errorMessage.toLowerCase().includes("user denied");

                    if (isRejected) {
                        // Show retry modal and countdown
                        setShowRetryModal(true);
                        setRetryCountdown(5);

                        // Start countdown and retry
                        const countdownInterval = setInterval(() => {
                            setRetryCountdown((prev) => {
                                if (prev <= 1) {
                                    clearInterval(countdownInterval);
                                    setShowRetryModal(false);
                                    hasAttemptedAutoLogin.current = false; // Allow retry
                                    return 0;
                                }
                                return prev - 1;
                            });
                        }, 1000);
                    } else {
                        throw error; // Re-throw for other errors
                    }
                }
            } finally {
                isAuthInProgress.current = false;
                if (isInitialLogin) {
                    setIsAuthLoading(false);
                }
            }
        },
        [signMessageAsync, saveAuthState, logout]
    );

    // Keep refs updated with latest function references
    performFarcasterAuthRef.current = performFarcasterAuth;
    performMetaMaskAuthRef.current = performMetaMaskAuth;

    // Public loginWithMetaMask (wrapper for initial login)
    const loginWithMetaMask = useCallback(
        async (connectedAddress?: string) => {
            const walletAddress = connectedAddress || address;
            if (!walletAddress) {
                throw new Error("Wallet not connected");
            }
            await performMetaMaskAuth(walletAddress, true);
        },
        [address, performMetaMaskAuth]
    );

    // Restore auth state from localStorage (check expiry and wallet address match)
    // Runs once on mount, then checks wallet address when wallet connects
    useEffect(() => {
        // Already restored - only re-check if wallet just connected
        if (hasRestoredAuth.current) {
            // Wallet connected after initial restore - verify address match
            if (!isInMiniApp && isConnected && address && authUser) {
                if (
                    authUser.walletAddress?.toLowerCase() !==
                    address.toLowerCase()
                ) {
                    logger.debug(
                        "Connected wallet address mismatch, clearing auth...",
                        { stored: authUser.walletAddress, connected: address }
                    );
                    logout();
                }
            }
            return;
        }

        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser && !isTokenExpired()) {
            try {
                const parsedUser: AuthUser = JSON.parse(storedUser);

                // For browser wallet: check if stored wallet matches connected wallet
                // Skip this check in MiniApp (uses Farcaster auth) or if wallet not yet connected
                if (!isInMiniApp && isConnected && address) {
                    if (
                        parsedUser.walletAddress?.toLowerCase() !==
                        address.toLowerCase()
                    ) {
                        logger.debug(
                            "Stored wallet address mismatch, clearing auth...",
                            {
                                stored: parsedUser.walletAddress,
                                connected: address,
                            }
                        );
                        logout();
                        setIsAuthLoading(false);
                        hasRestoredAuth.current = true;
                        return;
                    }
                }

                setAccessToken(storedToken);
                setAuthUser(parsedUser);
                setIsAuthenticated(true);
                logger.debug("Restored auth from localStorage (token valid)");
            } catch {
                logout();
            }
        } else if (storedToken) {
            logger.debug("Stored token expired, clearing...");
            logout();
        }
        setIsAuthLoading(false);
        hasRestoredAuth.current = true;
    }, [logout, isInMiniApp, isConnected, address, authUser]);

    // Periodic token expiry check (every minute)
    // Uses refs to avoid re-running on function reference changes
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkAndRefresh = () => {
            if (isTokenExpired()) {
                logger.debug("Token expired or expiring soon, refreshing...");
                if (isInMiniApp) {
                    performFarcasterAuthRef.current?.(false);
                } else if (isConnected && address) {
                    performMetaMaskAuthRef.current?.(address, false);
                }
            }
        };

        // Only check on interval, not immediately (prevents re-trigger on mount/dependency change)
        const interval = setInterval(checkAndRefresh, 60 * 1000);
        return () => clearInterval(interval);
    }, [isAuthenticated, isInMiniApp, isConnected, address]);

    // Farcaster Quick Auth flow (auto-login in miniapp)
    useEffect(() => {
        // Wait for FrameProvider context to be ready before checking isInMiniApp
        if (!isContextReady) return;
        if (!isInMiniApp || isAuthenticated) {
            return;
        }
        // Wait for wallet to be connected (address is required for loginWithFarcaster)
        if (!isConnected || !address) {
            logger.debug("Waiting for wallet address before Farcaster auth...");
            return;
        }
        performFarcasterAuth(true);
    }, [
        isContextReady,
        isInMiniApp,
        isAuthenticated,
        isConnected,
        address,
        performFarcasterAuth,
    ]);

    // Prompt for notification permission once after Farcaster auth
    useEffect(() => {
        if (!isInMiniApp || !isAuthenticated) return;

        const hasPrompted =
            localStorage.getItem(NOTIFICATION_PROMPT_SHOWN_KEY) === "true";
        if (hasPrompted) return;

        // Delay slightly to ensure UI is ready
        const timeout = setTimeout(async () => {
            try {
                localStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, "true");
                await sdk.actions.addMiniApp();
                logger.debug("Notification prompt shown");
            } catch (error) {
                logger.error("Failed to show notification prompt:", error);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [isInMiniApp, isAuthenticated]);

    // Browser wallet auto-login: if wallet is already connected but not authenticated
    // Uses hasAttemptedAutoLogin ref to prevent re-triggering
    useEffect(() => {
        if (isInMiniApp) return;
        if (isAuthenticated || isAuthLoading) return;
        if (!isConnected || !address) return;
        if (hasAttemptedAutoLogin.current) return; // Prevent re-attempt

        hasAttemptedAutoLogin.current = true;

        const timeoutId = setTimeout(() => {
            logger.debug(
                "Wallet connected, triggering auto-login after delay..."
            );
            loginWithMetaMask(address).catch((error) => {
                logger.error("Auto-login failed:", error);
                hasAttemptedAutoLogin.current = false; // Allow retry on failure
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

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<AuthContextType>(
        () => ({
            isAuthenticated,
            isAuthLoading,
            authUser,
            accessToken,
            loginWithMetaMask,
            refreshAuth: () => performFarcasterAuth(false),
            logout,
        }),
        [
            isAuthenticated,
            isAuthLoading,
            authUser,
            accessToken,
            loginWithMetaMask,
            performFarcasterAuth,
            logout,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}

            {/* Login Retry Modal */}
            {showRetryModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm text-center shadow-xl">
                        <div className="text-4xl mb-3">🔐</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Login Required
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please approve the signature request in your wallet
                            to continue.
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                            Retrying in {retryCountdown}s...
                        </p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}
