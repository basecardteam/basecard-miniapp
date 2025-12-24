import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Default IPFS gateway (uses env var or falls back to ipfs.io)
const DEFAULT_IPFS_GATEWAY =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || "ipfs.io";

/**
 * Get IPFS URL with configurable gateway
 * @param cid The CID or IPFS URI
 * @param gatewayUrl Optional gateway URL (defaults to ipfs.io)
 */
export const getIPFSUrl = (cid: string | undefined | null): string => {
    if (!cid) return "/assets/default-profile.png";
    const cleanCid = cid.replace("ipfs://", "");
    return `https://${DEFAULT_IPFS_GATEWAY}/ipfs/${cleanCid}`;
};

/**
 * Resolves an IPFS URI to a gateway URL.
 * If the URI is not an IPFS URI, it returns the original URI.
 * @param uri The URI to resolve
 * @returns The resolved HTTP URL
 */
export const resolveIpfsUrl = (uri: string | null | undefined): string => {
    if (!uri) return "";

    const cleanUri = uri.trim();

    // Already an HTTP URL
    if (cleanUri.startsWith("http://") || cleanUri.startsWith("https://")) {
        return cleanUri;
    }

    // IPFS URI
    if (cleanUri.startsWith("ipfs://")) {
        const cid = cleanUri.replace("ipfs://", "");
        return `https://${DEFAULT_IPFS_GATEWAY}/ipfs/${cid}`;
    }

    return cleanUri;
};

/**
 * Helper for API to create headers with optional auth token
 */
export const createHeaders = (accessToken: string): HeadersInit => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
};
