import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Default IPFS gateway (can be overridden by config)
const DEFAULT_IPFS_GATEWAY = "ipfs.io";

/**
 * Get IPFS URL with configurable gateway
 * @param cid The CID or IPFS URI
 * @param gatewayUrl Optional gateway URL (defaults to ipfs.io)
 */
export const getIPFSUrl = (
    cid: string | undefined | null,
    gatewayUrl?: string
): string => {
    if (!cid) return "/assets/default-profile.png";
    if (cid.startsWith("data:image")) return cid;
    if (cid.startsWith("http://") || cid.startsWith("https://")) return cid;

    const gateway = gatewayUrl || DEFAULT_IPFS_GATEWAY;
    const cleanCid = cid.replace("ipfs://", "");
    return `https://${gateway}/ipfs/${cleanCid}`;
};

/**
 * Resolves an IPFS URI to a gateway URL.
 * If the URI is not an IPFS URI, it returns the original URI.
 * @param uri The URI to resolve
 * @param gatewayUrl Optional gateway URL (defaults to ipfs.io)
 * @returns The resolved HTTP URL
 */
export const resolveIpfsUrl = (
    uri: string | null | undefined,
    gatewayUrl?: string
): string => {
    if (!uri) return "";

    const cleanUri = uri.trim();

    // Already an HTTP URL
    if (cleanUri.startsWith("http://") || cleanUri.startsWith("https://")) {
        return cleanUri;
    }

    // IPFS URI
    if (cleanUri.startsWith("ipfs://")) {
        const cid = cleanUri.replace("ipfs://", "");
        const gateway = gatewayUrl || DEFAULT_IPFS_GATEWAY;
        return `https://${gateway}/ipfs/${cid}`;
    }

    return cleanUri;
};
