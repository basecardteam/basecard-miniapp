"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface MiniAppClient {
    platformType?: "web" | "mobile";
    clientFid: number; // (9152=Farcaster, 309857=BaseApp)
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
    isContextReady: boolean;
} | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [context, setContext] = useState<
        MiniAppContext | Record<string, unknown> | null
    >(null);
    const [isInMiniApp, setIsInMiniApp] = useState(false);
    const [isContextReady, setIsContextReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const ctx = await sdk.context;
                sdk.actions.ready();
                await new Promise((resolve) => setTimeout(resolve, 50));

                const inMiniApp = await sdk.isInMiniApp();
                setContext(ctx);
                setIsInMiniApp(inMiniApp);
                setIsContextReady(true);
            } catch {
                setContext({ error: "Failed to initialize" });
                setIsInMiniApp(false);
                setIsContextReady(true);
            }
        };

        init();
    }, []);

    const frameContext = useMemo<FrameContextType>(
        () => ({
            context,
            isInMiniApp,
            isContextReady,
        }),
        [context, isInMiniApp, isContextReady]
    );

    return (
        <FrameContext.Provider value={frameContext}>
            {children}
        </FrameContext.Provider>
    );
}
