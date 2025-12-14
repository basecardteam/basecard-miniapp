"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
import { activeChain, getConfig } from "@/lib/wagmi";
import { NetworkChecker } from "../feedback/NetworkChecker";

export default function Provider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );
    const wagmiConfig = useMemo(() => getConfig(), []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <OnchainKitProvider
                apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
                chain={activeChain}
                config={{
                    appearance: {
                        mode: "auto",
                    },
                    wallet: {
                        display: "modal",
                    },
                }}
                miniKit={{
                    enabled: true,
                    autoConnect: true,
                }}
            >
                <NetworkChecker />
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </OnchainKitProvider>
        </WagmiProvider>
    );
}
