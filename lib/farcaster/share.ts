/**
 * Farcaster Mini App Sharing Utilities
 *
 * Based on: https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast
 *
 * This utility provides functions to share content from Mini Apps
 * using the Farcaster SDK's composeCast action.
 */

import { sdk } from "@farcaster/miniapp-sdk";

// =============================================================================
// Constants
// =============================================================================

/** Default promotional text for BaseCard shares */
export const DEFAULT_SHARE_TEXT = "Just minted my BaseCard ✨ Mint yours!";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for sharing to Farcaster
 */
export interface ShareToFarcasterOptions {
    /** Text content for the cast (defaults to promotional text) */
    text?: string;
    /** URL to embed (will show as Mini App embed if the page has fc:miniapp meta tags) */
    embedUrl?: string;
    /** Image URL to embed directly in the cast */
    imageUrl?: string;
    /** Close the Mini App after posting (default: false) */
    closeAfterPost?: boolean;
    /** Channel to post to (optional) */
    channelKey?: string;
}

/**
 * Result of the share action
 */
export interface ShareResult {
    success: boolean;
    /** Cast hash if successful */
    castHash?: string;
    /** Channel key if posted to a channel */
    channelKey?: string;
    /** Whether the user cancelled the cast */
    cancelled?: boolean;
    /** Error message if failed */
    error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if we're running inside a Farcaster Mini App
 */
export async function isInMiniApp(): Promise<boolean> {
    try {
        return await sdk.isInMiniApp();
    } catch {
        return false;
    }
}

/**
 * Build embeds tuple from image and URL
 * SDK expects: [] | [string] | [string, string]
 * Order: [imageUrl, embedUrl] - image first shows as main image
 */
function buildEmbeds(
    imageUrl?: string,
    embedUrl?: string
): [] | [string] | [string, string] | undefined {
    const img = imageUrl?.trim();
    const url = embedUrl?.trim();

    if (img && url) {
        return [img, url];
    } else if (img) {
        return [img];
    } else if (url) {
        return [url];
    }
    return undefined;
}

// =============================================================================
// Main Share Function
// =============================================================================

/**
 * Share content to Farcaster using the SDK's composeCast action.
 *
 * When inside a Mini App, this opens the native compose UI.
 * When outside (browser), falls back to Warpcast intent URL.
 *
 * @example
 * ```ts
 * // Share with default promotional text
 * await shareToFarcaster({
 *   imageUrl: "https://gateway.pinata.cloud/ipfs/...",
 *   embedUrl: "https://miniapp.basecard.org/card/0x1234...",
 * });
 *
 * // Share with custom text
 * await shareToFarcaster({
 *   text: "Check out this amazing BaseCard!",
 *   embedUrl: "https://miniapp.basecard.org/card/0x1234...",
 * });
 * ```
 */
export async function shareToFarcaster(
    options: ShareToFarcasterOptions
): Promise<ShareResult> {
    const {
        text = DEFAULT_SHARE_TEXT,
        embedUrl,
        imageUrl,
        closeAfterPost = true,
        channelKey,
    } = options;

    // Build embeds: [imageUrl, embedUrl] - image first, link second
    const embeds = buildEmbeds(imageUrl, embedUrl);

    try {
        // Check if we're in a Mini App context
        const inMiniApp = await isInMiniApp();

        if (inMiniApp) {
            // Use SDK's composeCast action for native experience
            const result = await sdk.actions.composeCast({
                text,
                embeds,
                close: closeAfterPost,
                channelKey,
            });

            // result.cast is null if user cancels
            if (result?.cast) {
                console.log("cast hash: ", result.cast.hash);
                return {
                    success: true,
                    castHash: result.cast.hash,
                    channelKey: result.cast.channelKey,
                };
            }

            // User cancelled the cast
            return {
                success: false,
                cancelled: true,
                error: "Cast composition cancelled by user",
            };
        } else {
            // Fallback to Warpcast intent URL for browser
            openWarpcastCompose(text, imageUrl, embedUrl);
            return {
                success: true, // We can't know if user actually posted
            };
        }
    } catch (error) {
        console.error("Failed to share to Farcaster:", error);

        // Fallback to Warpcast intent URL
        openWarpcastCompose(text, imageUrl, embedUrl);
        return {
            success: true, // Opened fallback
            error: `Used fallback: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        };
    }
}

// =============================================================================
// Fallback Functions
// =============================================================================

/**
 * Open Warpcast compose intent URL (fallback for non-Mini App context)
 */
export function openWarpcastCompose(
    text: string,
    imageUrl?: string,
    embedUrl?: string
): void {
    const encodedText = encodeURIComponent(text);
    let url = `https://warpcast.com/~/compose?text=${encodedText}`;

    // Add image first, then embed URL (same order as SDK)
    if (imageUrl) {
        url += `&embeds[]=${encodeURIComponent(imageUrl)}`;
    }
    if (embedUrl) {
        url += `&embeds[]=${encodeURIComponent(embedUrl)}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
}
