export const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    accountAssociation: {
        header: process.env.NEXT_PUBLIC_ASSOCIATION_HEADER!,
        payload: process.env.NEXT_PUBLIC_ASSOCIATION_PAYLOAD!,
        signature: process.env.NEXT_PUBLIC_ASSOCIATION_SIGNATURE!,
    },
    miniapp: {
        version: "1",
        "name": "BaseCard",
        "iconUrl": `${ROOT_URL}/bc-icon.png`,
        "homeUrl": `${ROOT_URL}`,
        "imageUrl": `${ROOT_URL}/image.png`,
        "buttonTitle": "Launch BaseCard",
        "splashImageUrl": `${ROOT_URL}/bc-icon.png`,
        "splashBackgroundColor": "#ffffff",
        "webhookUrl": `${ROOT_URL}/api/webhook`,
        "subtitle": "Builder Identity on Base",
        "description": "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        "primaryCategory": "social",
        "heroImageUrl": `${ROOT_URL}/bc-hero.png`,
        "ogImageUrl": `${ROOT_URL}/bc-embed-image.png`,
        "ogTitle": "BaseCard",
        "tags": [
            "social",
            "basecard",
            "identity",
            "earn",
            "card"
        ],
        "embedImageUrl": `${ROOT_URL}/bc-embed-image.png`,
        // TODO: ...
        // tagline
        // ogDescriptionaa
        // metadata in the layout
    },
} as const;
