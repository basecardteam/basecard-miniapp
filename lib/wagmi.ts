import { minikitConfig } from "@/minikit.config";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { base, baseSepolia } from "viem/chains";
import {
    cookieStorage,
    createConfig,
    createStorage,
    fallback,
    http,
} from "wagmi";
import { baseAccount, coinbaseWallet, metaMask } from "wagmi/connectors";
import {
    BASE_RPC_ENDPOINTS,
    BASE_SEPOLIA_RPC_ENDPOINTS,
    RPC_CONFIG,
} from "./rpc";

/**
 * Network Configuration
 */
export const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";
export const activeChain = isTestnet ? baseSepolia : base;

/**
 * Create wagmi config with RPC fallback
 *
 * Uses multiple RPC endpoints with automatic fallback for reliability.
 * If primary RPC fails, it will try the next one immediately.
 */
export function getConfig() {
    return createConfig({
        chains: [activeChain],
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
            metaMask(),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            // Base Mainnet with fallback
            [base.id]: fallback(
                BASE_RPC_ENDPOINTS.map((url) =>
                    http(url, {
                        timeout: RPC_CONFIG.timeout,
                        retryCount: RPC_CONFIG.retryCount,
                    })
                )
            ),
            // Base Sepolia with fallback
            [baseSepolia.id]: fallback(
                BASE_SEPOLIA_RPC_ENDPOINTS.map((url) =>
                    http(url, {
                        timeout: RPC_CONFIG.timeout,
                        retryCount: RPC_CONFIG.retryCount,
                    })
                )
            ),
        },
    });
}
