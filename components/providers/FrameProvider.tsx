"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const NOTIFICATION_PROMPT_SHOWN_KEY = "basecard_notification_prompt_shown";

interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface MiniAppClient {
    platformType?: "web" | "mobile";
    clientFid: number;
    added: boolean;
    safeAreaInsets?: SafeAreaInsets;
    notificationDetails?: {
        url: string;
        token: string;
    };
}

export interface MiniAppContext {
    user: {
        fid: number;
        username?: string;
        displayName?: string;
        pfpUrl?: string;
    };
    location?: Record<string, unknown>;
    client: MiniAppClient;
}

type FrameContextType = {
    context: MiniAppContext | Record<string, unknown> | null;
    isInMiniApp: boolean;
    requestNotificationPermission: () => Promise<{
        success: boolean;
        notificationDetails?: { url: string; token: string } | null;
        reason?: string;
    }>;
    isNotificationLoading: boolean;
} | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [context, setContext] = useState<MiniAppContext | Record<string, unknown> | null>(null);
    const [isInMiniApp, setIsInMiniApp] = useState(false);
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);

    const requestNotificationPermission = useCallback(async () => {
        setIsNotificationLoading(true);

        try {
            const inMiniApp = await sdk.isInMiniApp();
            if (!inMiniApp) {
                setIsNotificationLoading(false);
                return { success: false, reason: "not_in_miniapp" };
            }

            const response = await sdk.actions.addMiniApp();

            setIsNotificationLoading(false);

            if (response.notificationDetails) {
                return { success: true, notificationDetails: response.notificationDetails };
            } else {
                return { success: true, notificationDetails: null };
            }
        } catch (error) {
            console.error("Failed to request notification permission:", error);
            setIsNotificationLoading(false);
            return { success: false, reason: "error" };
        }
    }, []);

    const promptNotificationOnce = useCallback(async () => {
        const hasPrompted = localStorage.getItem(NOTIFICATION_PROMPT_SHOWN_KEY) === "true";

        if (hasPrompted) {
            return;
        }

        localStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, "true");
        await requestNotificationPermission();
    }, [requestNotificationPermission]);

    useEffect(() => {
        const init = async () => {
            try {
                const ctx = await sdk.context;
                sdk.actions.ready();
                await new Promise((resolve) => setTimeout(resolve, 100));

                const inMiniApp = await sdk.isInMiniApp();
                setContext(ctx);
                setIsInMiniApp(inMiniApp);

                // Prompt notification on first launch
                if (inMiniApp) {
                    promptNotificationOnce();
                }
            } catch {
                setContext({ error: "Failed to initialize" });
                setIsInMiniApp(false);
            }
        };

        init();
    }, [promptNotificationOnce]);

    const frameContext: FrameContextType = {
        context,
        isInMiniApp,
        requestNotificationPermission,
        isNotificationLoading,
    };

    return (
        <FrameContext.Provider value={frameContext}>
            {children}
        </FrameContext.Provider>
    );
}
