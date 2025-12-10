/**
 * Resolves an IPFS URI to a gateway URL.
 * If the URI is not an IPFS URI, it returns the original URI.
 * @param uri The URI to resolve
 * @returns The resolved HTTP URL
 */
export const resolveIpfsUrl = (uri: string | null | undefined): string => {
    if (!uri) return "";

    const cleanUri = uri.trim();

    if (cleanUri.startsWith("ipfs://")) {
        // Remove 'ipfs://' prefix
        const cid = cleanUri.replace("ipfs://", "");
        // Use a public gateway (e.g., Cloudflare, IPFS.io, or Pinata)
        // Ideally this should be configurable via env vars
        return `https://ipfs.io/ipfs/${cid}`;
    }

    return cleanUri;
};
