import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@/hooks/api/useUser";
import { useAuth } from "@/components/providers/AuthProvider";
import { useFrameContext, MiniAppContext } from "@/components/providers/FrameProvider";
import { LinkedInConnectStatus } from "@/features/mint/components/LinkedInConnect";
import { disconnectOAuth, getOAuthStatus, initOAuth } from "@/lib/api/oauth";

const POLLING_INTERVAL = 3000; // 3 seconds

interface UseLinkedInAuthProps {
    onUsernameChange?: (username: string) => void;
    initialUsername?: string;
    initialVerified?: boolean;
}

interface UseLinkedInAuthReturn {
    status: LinkedInConnectStatus;
    username: string | null;
    displayName: string | null;
    error: string | null;
    authUrl: string | null;
    isConnecting: boolean;
    connect: () => Promise<string | null>;
    disconnect: () => Promise<void>;
    clearAuthUrl: () => void;
}

export function useLinkedInAuth({
    onUsernameChange,
    initialUsername,
    initialVerified = false,
}: UseLinkedInAuthProps = {}): UseLinkedInAuthReturn {
    const { user } = useUser();
    const { accessToken } = useAuth();
    const frameContext = useFrameContext();
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<LinkedInConnectStatus>(
        initialUsername && initialVerified ? "connected" : "disconnected",
    );
    const [username, setUsername] = useState<string | null>(
        initialUsername || null,
    );
    const [displayName, setDisplayName] = useState<string | null>(null);
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
            if (user?.id) {
                checkConnectionStatus();
            }
        } else {
            setStatus("disconnected");
        }

        return () => stopPolling();
    }, [initialUsername, initialVerified, user?.id]);

    // Check connection status from backend
    const checkConnectionStatus = useCallback(async () => {
        if (!user) return;

        try {
            if (!accessToken) return;

            const result = await getOAuthStatus("linkedin", accessToken);

            if (result.connected && result.username) {
                setStatus("connected");
                setUsername(result.username);
                // If backend sends displayName, use it. Otherwise fallback to handle.
                setDisplayName(result.displayName || result.username);
                if (onUsernameChange) {
                    onUsernameChange(result.username);
                }
                stopPolling(); // Connected, stop polling
                setAuthUrl(null); // Close modal if open
            }
        } catch (err) {
            console.error("Failed to check LinkedIn status:", err);
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
            setError("로그인이 필요합니다.");
            return null;
        }

        setIsConnecting(true);
        setError(null);

        try {
            if (!accessToken) throw new Error("No access token");

            // 1. Get Auth URL from Backend
            // Use client FID from frame context (app's FID: 9152=Warpcast, 309857=BaseApp)
            // NOT user.fid which is the user's personal Farcaster ID
            const clientFid = (frameContext?.context as MiniAppContext)?.client?.clientFid?.toString();
            const { authUrl: url } = await initOAuth(
                "linkedin",
                accessToken,
                clientFid,
            );

            // 2. Return URL for Iframe/Modal to display
            setAuthUrl(url);

            // 3. Start polling for completion
            startPolling();

            return url;
        } catch (err) {
            setStatus("disconnected");
            setError(
                err instanceof Error ? err.message : "연결에 실패했습니다.",
            );
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, [user, accessToken, startPolling]);

    const disconnect = useCallback(async () => {
        try {
            if (!accessToken) return;

            await disconnectOAuth("linkedin", accessToken);

            setStatus("disconnected");
            setUsername(null);
            setDisplayName(null);
            if (onUsernameChange) {
                onUsernameChange("");
            }
            stopPolling();
        } catch (err) {
            console.error("Disconnect failed:", err);
            setError("연결 해제에 실패했습니다.");
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
        displayName,
        error,
        authUrl,
        clearAuthUrl,
    };
}
