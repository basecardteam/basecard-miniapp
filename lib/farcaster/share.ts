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
    const { text = "", embedUrl } = options;

    try {
        // Check if we're in a Mini App context
        const inMiniApp = await isInMiniApp();

        if (inMiniApp) {
            // Use SDK's composeCast action for native experience
            const result = await sdk.actions.composeCast({
                text,
                embeds: embedUrl ? [embedUrl] : undefined,
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
            openWarpcastCompose(text, embedUrl);
            return {
                success: true, // We can't know if user actually posted
            };
        }
    } catch (error) {
        console.error("Failed to share to Farcaster:", error);

        // Fallback to Warpcast intent URL
        openWarpcastCompose(text, embedUrl);
        return {
            success: true, // Opened fallback
            error: "Used fallback (Warpcast intent URL)",
        };
    }
}

/**
 * Open Warpcast compose intent URL (fallback for non-Mini App context)
 */
export function openWarpcastCompose(text: string, embedUrl?: string): void {
    const encodedText = encodeURIComponent(text);
    let url = `https://warpcast.com/~/compose?text=${encodedText}`;

    if (embedUrl) {
        url += `&embeds[]=${encodeURIComponent(embedUrl)}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Generate the share URL for a BaseCard
 * This URL should have fc:miniapp meta tags for proper embed rendering
 */
export function getBaseCardShareUrl(address: string): string {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://app.basecard.org";
    return `${baseUrl}/card/${address}`;
}

/**
 * Default share message for BaseCard
 */
export function getDefaultShareMessage(nickname?: string): string {
    if (nickname) {
        return `Check out ${nickname}'s BaseCard! 🎉`;
    }
    return "I just minted my BaseCard! Collect this and check all about myself 🎉";
}
