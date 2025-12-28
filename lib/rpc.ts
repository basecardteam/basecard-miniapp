/**
 * RPC Fallback Configuration
 *
 * Multiple RPC endpoints with automatic fallback for reliability.
 * Based on ReviewMe pattern: https://github.com/cyh76507707/reviewme-opensource
 *
 * Strategy:
 * - 2 second timeout per endpoint
 * - 0 retries (move to next immediately)
 * - Sequential fallback order
 */

// =============================================================================
// Base Mainnet RPC Endpoints
// =============================================================================

export const BASE_RPC_ENDPOINTS = [
    // Custom RPC (highest priority if set)
    process.env.NEXT_PUBLIC_BASE_RPC_URL,
    // Public endpoints
    "https://base-rpc.publicnode.com",
    "https://base.drpc.org",
    "https://base.llamarpc.com",
    "https://mainnet.base.org",
    "https://developer-access-mainnet.base.org",
    "https://base-mainnet.public.blastapi.io",
    "https://1rpc.io/base",
    "https://base.meowrpc.com",
    "https://endpoints.omniatech.io/v1/base/mainnet/public",
].filter(Boolean) as string[];

// =============================================================================
// Base Sepolia (Testnet) RPC Endpoints
// =============================================================================

export const BASE_SEPOLIA_RPC_ENDPOINTS = [
    // Custom RPC (highest priority if set)
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
    // Public endpoints
    "https://sepolia.base.org",
    "https://base-sepolia-rpc.publicnode.com",
    "https://base-sepolia.drpc.org",
    "https://base-sepolia.blockpi.network/v1/rpc/public",
].filter(Boolean) as string[];

// =============================================================================
// RPC Configuration
// =============================================================================

export const RPC_CONFIG = {
    timeout: 2000, // 2 seconds - fail fast
    retryCount: 0, // Don't retry, move to next endpoint
} as const;
