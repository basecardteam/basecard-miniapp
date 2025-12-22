/**
 * Farcaster Mini App Sharing Utilities
 *
 * Based on: https://miniapps.farcaster.xyz/docs/guides/sharing
 *
 * This utility provides functions to share content from Mini Apps
 * using the Farcaster SDK's composeCast action.
 */

import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Options for sharing to Farcaster
 */
export interface ShareToFarcasterOptions {
    /** Text content for the cast */
    text?: string;
    /** URL to embed (will show as Mini App embed if the page has fc:miniapp meta tags) */
    embedUrl?: string;
    /** Image URL to embed directly in the cast */
    imageUrl?: string;
    /** Close the compose window after posting (default: false) */
    closeAfterPost?: boolean;
}

/**
 * Result of the share action
 */
export interface ShareResult {
    success: boolean;
    /** Cast hash if successful */
    castHash?: string;
    /** Error message if failed */
    error?: string;
}

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
 * Share content to Farcaster using the SDK's composeCast action.
 *
 * When inside a Mini App, this opens the native compose UI.
 * When outside (browser), falls back to Warpcast intent URL.
 *
 * @example
 * ```ts
 * await shareToFarcaster({
 *   text: "Check out my BaseCard! 🎉",
 *   embedUrl: "https://app.basecard.org/card/0x1234...",
 * });
 * ```
 */
export async function shareToFarcaster(
    options: ShareToFarcasterOptions
): Promise<ShareResult> {
    const { text = "", embedUrl, imageUrl } = options;

    // Build embeds tuple: image first (shows as main image), then URL
    // SDK expects tuple of max 2 elements
    type EmbedsTuple = [] | [string] | [string, string];
    let embeds: EmbedsTuple | undefined;

    if (imageUrl && embedUrl) {
        embeds = [imageUrl, embedUrl];
    } else if (imageUrl) {
        embeds = [imageUrl];
    } else if (embedUrl) {
        embeds = [embedUrl];
    }

    try {
        // Check if we're in a Mini App context
        const inMiniApp = await isInMiniApp();

        if (inMiniApp) {
            // Use SDK's composeCast action for native experience
            const result = await sdk.actions.composeCast({
                text,
                embeds,
            });

            // composeCast returns the cast details on success
            if (result && "hash" in result) {
                return {
                    success: true,
                    castHash: result.hash as string,
                };
            }

            // User might have cancelled
            return {
                success: false,
                error: "Cast was cancelled or failed",
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
            error: "Used fallback (Warpcast intent URL)",
        };
    }
}

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

    // Add image first, then embed URL
    if (imageUrl) {
        url += `&embeds[]=${encodeURIComponent(imageUrl)}`;
    }
    if (embedUrl) {
        url += `&embeds[]=${encodeURIComponent(embedUrl)}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
}
