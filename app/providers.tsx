"use client";

import { ModalContainer } from "@/components/modals/BaseModal";
import AuthProvider from "@/components/providers/AuthProvider";
import FrameProvider from "@/components/providers/FrameProvider";
import { ToastContainer } from "@/components/ui/Toast";
import dynamic from "next/dynamic";

const WagmiProvider = dynamic(
    () => import("@/components/providers/WagmiProvider"),
    {
        ssr: false,
    }
);

const ErudaProvider = dynamic(
    () => import("@/components/providers/ErudaProvider"),
    {
        ssr: false,
    }
);

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider>
            <FrameProvider>
                <AuthProvider>
                    <ErudaProvider />
                    <div className="max-w-[600px] mx-auto relative">
                        {children}
                    </div>
                    <ToastContainer />
                    <ModalContainer />
                </AuthProvider>
            </FrameProvider>
        </WagmiProvider>
    );
}
