import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUser } from "@/hooks/api/useUser";
import { GitHubConnectStatus } from "@/features/mint/components/GitHubConnect";
import { disconnectOAuth, getOAuthStatus, initOAuth } from "@/lib/api/oauth";

const POLLING_INTERVAL = 3000; // 3 seconds

interface UseGitHubAuthProps {
    onUsernameChange?: (username: string) => void;
    initialUsername?: string;
    initialVerified?: boolean;
}

interface UseGitHubAuthReturn {
    status: GitHubConnectStatus;
    username: string | null;
    error: string | null;
    authUrl: string | null;
    isConnecting: boolean;
    connect: () => Promise<string | null>;
    disconnect: () => Promise<void>;
    clearAuthUrl: () => void;
}

export function useGitHubAuth({
    onUsernameChange,
    initialUsername,
    initialVerified = false,
}: UseGitHubAuthProps = {}): UseGitHubAuthReturn {
    const { user } = useUser();
    const { accessToken } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<GitHubConnectStatus>(
        initialUsername && initialVerified ? "connected" : "disconnected",
    );
    const [username, setUsername] = useState<string | null>(
        initialUsername || null,
    );
    const [error, setError] = useState<string | null>(null);
    const [authUrl, setAuthUrl] = useState<string | null>(null);

    // Polling control
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);

    // Initial check
    useEffect(() => {
        if (initialUsername && initialVerified) {
            setStatus("connected");
            setUsername(initialUsername);
            if (onUsernameChange && initialUsername) {
                onUsernameChange(initialUsername);
            }
        } else if (!initialUsername) {
            // Only check if we have a user and no initial username
            if (user?.id) {
                checkConnectionStatus();
            }
        } else {
            // Handle case where handle exists but not verified (e.g. forced disconnect state or wait for verification?)
            // For now, if verified is false, we want it to be disconnected.
            setStatus("disconnected");
        }

        return () => stopPolling();
    }, [initialUsername, initialVerified, user?.id]);

    // Check connection status from backend
    const checkConnectionStatus = useCallback(async () => {
        if (!user) return;

        try {
            if (!accessToken) return;

            const result = await getOAuthStatus("github", accessToken);

            if (result.connected && result.username) {
                setStatus("connected");
                setUsername(result.username);
                if (onUsernameChange) {
                    onUsernameChange(result.username);
                }
                stopPolling(); // Connected, stop polling
                setAuthUrl(null); // Close modal if open
            }
        } catch (err) {
            console.error("Failed to check GitHub status:", err);
        }
    }, [user, accessToken, onUsernameChange]);

    const startPolling = useCallback(() => {
        if (isPollingRef.current) return;
        isPollingRef.current = true;

        // Immediate check
        checkConnectionStatus();

        pollingIntervalRef.current = setInterval(
            checkConnectionStatus,
            POLLING_INTERVAL,
        );
    }, [checkConnectionStatus]);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        isPollingRef.current = false;
    }, []);

    // Listen for window focus to refresh status when coming back from OAuth
    useEffect(() => {
        const handleFocus = () => {
            if (status !== "connected") {
                checkConnectionStatus();
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [checkConnectionStatus, status]);

    const connect = useCallback(async () => {
        if (!user) {
            setError("Login is required.");
            return null;
        }

        setIsConnecting(true);
        setError(null);

        try {
            if (!accessToken) throw new Error("No access token");

            // 1. Get Auth URL from Backend
            const clientFid = user.fid?.toString();
            const { authUrl: url } = await initOAuth(
                "github",
                accessToken,
                clientFid,
            );

            console.log("GitHub auth URL:", url);

            // 2. Return URL for Iframe/Modal to display
            setAuthUrl(url);

            // 3. Start polling for completion
            startPolling();

            return url;
        } catch (err) {
            setStatus("disconnected");
            setError(err instanceof Error ? err.message : "Failed to connect.");
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, [user, accessToken, startPolling]);

    const disconnect = useCallback(async () => {
        try {
            if (!accessToken) {
                console.warn("No access token found for disconnect");
                return;
            }

            await disconnectOAuth("github", accessToken);

            console.log("GitHub disconnected successfully");
            setStatus("disconnected");
            setUsername(null);
            if (onUsernameChange) {
                onUsernameChange("");
            }
            stopPolling();
        } catch (err) {
            console.error("Disconnect failed:", err);
            setError("Failed to disconnect.");
        }
    }, [accessToken, onUsernameChange, stopPolling]);

    const clearAuthUrl = useCallback(() => {
        setAuthUrl(null);
    }, []);

    return {
        connect,
        disconnect,
        isConnecting,
        status,
        username,
        error,
        authUrl,
        clearAuthUrl,
    };
}
