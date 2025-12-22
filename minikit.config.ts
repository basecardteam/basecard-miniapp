export const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    "accountAssociation": {
        "header": "eyJmaWQiOjE0NTk3ODgsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhhRjkyOTI3MTJkOGE3YjM2RDZBM2IyZjdDNzUzODNFNmMzNmIwNTAxIn0",
        "payload": "eyJkb21haW4iOiJtaW5pYXBwLmJhc2VjYXJkLm9yZyJ9",
        "signature": "P9Gv/9x9WZnq8es54YVsoUXLSD5vNW89u0H6UDDEYfgg1unljLmYouanhtI6e6fty5RgbbQf5XBFsjwo5i7bARw="
    },
    miniapp: {
        version: "1",
        "name": "BaseCard",
        "iconUrl": `${ROOT_URL}/bc-icon.png`,
        "homeUrl": `${ROOT_URL}`,
        "imageUrl": `${ROOT_URL}/bc-icon.png`,
        "buttonTitle": "Launch BaseCard",
        "splashImageUrl": `${ROOT_URL}/bc-icon.png`,
        "splashBackgroundColor": "#ffffff",
        "webhookUrl": `${ROOT_URL}/api/webhook`,
        "subtitle": "Builder Identity on Base",
        "description": "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        "primaryCategory": "social",
        "heroImageUrl": `${ROOT_URL}/bc-hero.webp`,
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
