"use client";

import { ReactNode } from "react";

import ErudaProvider from "@/components/providers/ErudaProvider";
import JotaiClientProvider from "@/components/providers/JotaiProvider";
import { MiniAppBootstrapper } from "@/components/providers/MiniAppBootstrapper";
import Provider from "@/components/providers/WagmiProvider";

export function RootProvider({ children }: { children: ReactNode }) {

    return (
        <>
            <ErudaProvider />
            <JotaiClientProvider>
                <Provider>
                    <MiniAppBootstrapper />
                    {children}
                </Provider>
            </JotaiClientProvider >
        </>
    );
}