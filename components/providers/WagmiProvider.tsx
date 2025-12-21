"use client";

import { getConfig } from "@/lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";

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
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
        // TODO: minikit나 onchainkit에 따라서 저거 설정이 달라짐.
        // Ref:
        //  https://github.com/Vicolee/frames-v2-demo/blob/main/src/components/providers/wagmi-provider.tsx
        //  https://docs.base.org/onchainkit/latest/components/minikit/hooks/useMiniKit
        //  https://docs.base.org/onchainkit/latest/components/minikit/provider-and-initialization
        // <WagmiProvider config={wagmiConfig}>
        //     <OnchainKitProvider
        //         apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        //         chain={activeChain}
        //         config={{
        //             appearance: {
        //                 mode: "auto",
        //             },
        //             wallet: {
        //                 display: "modal",
        //             },
        //         }}
        //         miniKit={{
        //             enabled: true,
        //             autoConnect: true,
        //         }}
        //     >
        //         <NetworkChecker />
        //         <QueryClientProvider client={queryClient}>
        //             {children}
        //         </QueryClientProvider>
        //     </OnchainKitProvider>
        // </WagmiProvider>
    );
}
