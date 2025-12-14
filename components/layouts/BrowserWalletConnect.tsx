"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import BaseButton from "@/components/buttons/BaseButton";
import ConnectedUserDisplay from "./ConnectedUserDisplay";
import { activeChain } from "@/lib/wagmi";
import { useCallback, useState } from "react";

export default function BrowserWalletConnect() {
    const { address, isConnected, } = useAccount();
    const { connectors, connectAsync, isPending: isConnectPending, reset: resetConnect } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChainAsync } = useSwitchChain();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = useCallback(
        async (connector: (typeof connectors)[0]) => {
            // Prevent double-click
            if (isConnecting || isConnectPending) {
                console.log("Connection already in progress");
                return;
            }

            setIsConnecting(true);

            // 1-minute timeout
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Connection timeout")), 60000)
            );

            try {
                // 1. Connect wallet with timeout
                const result = await Promise.race([
                    connectAsync({ connector }),
                    timeout
                ]);
                // 2. Check if on correct chain, if not switch
                if (result.chainId !== activeChain.id) {
                    try {
                        await Promise.race([
                            switchChainAsync({ chainId: activeChain.id }),
                            timeout
                        ]);
                    } catch (switchError) {
                        console.warn("Failed to switch chain:", switchError);
                    }
                }
            } catch (error: any) {
                console.error("Failed to connect:", error);
                // Reset connection state on error
                resetConnect();
            } finally {
                setIsConnecting(false);
            }
        },
        [connectAsync, switchChainAsync, isConnecting, isConnectPending, resetConnect]
    );

    if (isConnected && address) {
        return (
            <div className="relative group">
                <div className="cursor-pointer">
                    <ConnectedUserDisplay />
                </div>

                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50 scale-95 group-hover:scale-100">
                    {/* 화살표 */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100 shadow-sm" />

                    {/* 팝업 본체 */}
                    <div className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => disconnect()}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-500 hover:bg-red-50/50 transition-all duration-150 whitespace-nowrap"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Attempt to find MetaMask or similar injected wallet
    // Priority: 1. MetaMask (io.metamask) 2. Injected 3. First available
    const metaMaskConnector = connectors.find(
        (c) =>
            c.id === "io.metamask" || c.name.toLowerCase().includes("metamask")
    );
    const targetConnector = metaMaskConnector || connectors[0];

    const isPending = isConnecting || isConnectPending;

    return (
        <div className="flex gap-2">
            {targetConnector ? (
                <BaseButton
                    key={targetConnector.uid}
                    onClick={() => handleConnect(targetConnector)}
                    disabled={isPending}
                    className="w-auto py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-full shadow-none disabled:opacity-50"
                >
                    {isPending ? "Connecting..." : "Connect Wallet"}
                </BaseButton>
            ) : (
                <div className="text-xs text-red-500">No Wallet Found</div>
            )}
        </div>
    );
}
