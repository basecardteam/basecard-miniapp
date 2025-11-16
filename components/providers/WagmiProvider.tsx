"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";

import { activeChain, getConfig } from "@/lib/wagmi";

import { NetworkChecker } from "../common/NetworkChecker";


export default function Provider({ children }: { children: React.ReactNode }) {
    // QueryClient 최적화: 미니앱 환경에 맞춘 캐싱 전략
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5분
                        gcTime: 10 * 60 * 1000, // 10분 (기존 cacheTime)
                        refetchOnWindowFocus: false, // 미니앱에서는 불필요
                        retry: 1, // 실패 시 1번만 재시도
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
                        preference: "all",
                    },
                }}
                miniKit={{
                    enabled: true,
                    autoConnect: true,
                }}
            >
                <NetworkChecker />
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </OnchainKitProvider>
        </WagmiProvider>
    );
}
