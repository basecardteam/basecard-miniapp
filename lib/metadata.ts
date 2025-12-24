import { minikitConfig, ROOT_URL } from "@/minikit.config";
import { Metadata } from "next";

// =============================================================================
// Default Metadata
// =============================================================================

export const DEFAULT_METADATA: Metadata = {
    title: "BaseCard - Builder Identity on Base",
    description:
        "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
    icons: {
        icon: "/bc-icon.png",
        apple: "/bc-icon.png",
    },
    openGraph: {
        title: "BaseCard - Builder Identity on Base",
        description:
            "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        images: [
            {
                url: `${ROOT_URL}/bc-embed-image.png`,
                width: 1200,
                height: 630,
                alt: "BaseCard - Builder Identity on Base",
            },
        ],
        siteName: "BaseCard",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "BaseCard - Builder Identity on Base",
        description:
            "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        images: [`${ROOT_URL}/bc-embed-image.png`],
    },
    other: {
        "fc:miniapp": JSON.stringify({
            version: "next",
            imageUrl: `${ROOT_URL}/bc-embed-image.png`,
            button: {
                title: minikitConfig.miniapp.buttonTitle,
                action: {
                    type: "launch_frame",
                    name: minikitConfig.miniapp.name,
                    url: ROOT_URL,
                    splashImageUrl: minikitConfig.miniapp.splashImageUrl,
                    splashBackgroundColor:
                        minikitConfig.miniapp.splashBackgroundColor,
                },
            },
        }),
    },
};

// =============================================================================
// Construct Metadata Function
// =============================================================================

interface ConstructMetadataProps {
    /** Page title (will append "| BaseCard" if not already included) */
    title?: string;
    /** Page description */
    description?: string;
    /** Path for the page URL (e.g., "/basecard/0x1234") */
    path?: string;
    /** Image URL for OG/Twitter/fc:miniapp preview */
    imageUrl?: string;
    /** Button title for fc:miniapp (default: "Launch BaseCard") */
    frameButtonTitle?: string;
}

/**
 * Construct metadata for a page with fc:miniapp support
 * Based on ReviewMe's metadata pattern
 *
 * @param title - Page title (appends "| BaseCard" if not included)
 * @param description - Page description
 * @param path - Path for deep linking (e.g., "/basecard/123")
 * @param imageUrl - Image URL for previews
 * @param frameButtonTitle - Button title for fc:miniapp
 */
export function constructMetadata({
    title,
    description,
    path = "",
    imageUrl,
    frameButtonTitle = "Launch BaseCard",
}: ConstructMetadataProps = {}): Metadata {
    // Generate full URL for deep linking
    const fullUrl = path ? `${ROOT_URL}${path}` : ROOT_URL;
    const image = imageUrl || `${ROOT_URL}/bc-embed-image.png`;

    // Process title - append "| BaseCard" if not already included
    const processedTitle = title
        ? title.includes("BaseCard")
            ? title
            : `${title} | BaseCard`
        : "BaseCard - Builder Identity on Base";

    const processedDescription =
        description ||
        "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard!";

    return {
        title: processedTitle,
        description: processedDescription,
        openGraph: {
            title: processedTitle,
            description: processedDescription,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: processedTitle,
                },
            ],
            siteName: "BaseCard",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: processedTitle,
            description: processedDescription,
            images: [image],
        },
        other: {
            // fc:miniapp metadata for rich Farcaster embeds
            "fc:miniapp": JSON.stringify({
                version: "1",
                imageUrl: image,
                button: {
                    title: frameButtonTitle,
                    action: {
                        type: "launch_frame",
                        name: minikitConfig.miniapp.name,
                        url: fullUrl, // ← Deep link to specific page!
                        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
                        splashBackgroundColor:
                            minikitConfig.miniapp.splashBackgroundColor,
                    },
                },
            }),
            // fc:frame for backward compatibility
            "fc:frame": JSON.stringify({
                version: "1",
                imageUrl: image,
                button: {
                    title: frameButtonTitle,
                    action: {
                        type: "launch_frame",
                        name: minikitConfig.miniapp.name,
                        url: fullUrl, // ← Deep link to specific page!
                        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
                        splashBackgroundColor:
                            minikitConfig.miniapp.splashBackgroundColor,
                    },
                },
            }),
        },
    };
}
