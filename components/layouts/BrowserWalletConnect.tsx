"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import BaseButton from "@/components/buttons/BaseButton";
import ConnectedUserDisplay from "./ConnectedUserDisplay";

export default function BrowserWalletConnect() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <ConnectedUserDisplay />

                <button
                    onClick={() => disconnect()}
                    className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors ml-2"
                >
                    Disconnect
                </button>
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

    return (
        <div className="flex gap-2">
            {targetConnector ? (
                <BaseButton
                    key={targetConnector.uid}
                    onClick={() => connect({ connector: targetConnector })}
                    className="w-auto py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-full shadow-none"
                >
                    Connect Wallet
                </BaseButton>
            ) : (
                <div className="text-xs text-red-500">No Wallet Found</div>
            )}
        </div>
    );
}
