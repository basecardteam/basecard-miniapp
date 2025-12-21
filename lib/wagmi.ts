import { minikitConfig } from "@/minikit.config";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { base, baseSepolia } from "viem/chains";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { baseAccount, coinbaseWallet, metaMask } from "wagmi/connectors";

// Use custom env variable for network selection
// NEXT_PUBLIC_USE_TESTNET=true -> Base Sepolia (testnet)
// NEXT_PUBLIC_USE_TESTNET=false or undefined -> Base Mainnet (production)
export const isTestnet = true;
export function getConfig() {
    return createConfig({
        chains: isTestnet ? [baseSepolia] : [base],
        connectors: [
            farcasterMiniApp(),
            baseAccount({
                appName: minikitConfig.miniapp.name,
                appLogoUrl: minikitConfig.miniapp.iconUrl,
            }),
            coinbaseWallet({
                appName: minikitConfig.miniapp.name,
                preference: "smartWalletOnly",
                version: "4",
            }),
            metaMask(), // Add additional connectors
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [base.id]: http(),
            [baseSepolia.id]: http(),
        },
    });
}

export const activeChain = isTestnet ? baseSepolia : base;
