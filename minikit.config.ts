export const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const ACCOUNT_HEADER = process.env.FARCASTER_HEADER || "";
const ACCOUNT_PAYLOAD = process.env.FARCASTER_PAYLOAD || "";
const ACCOUNT_SIGNATURE = process.env.FARCASTER_SIGNATURE || "";
const ALLOWED_ADDRESSES_STRING = process.env.ALLOWED_BUILDER_ADDRESSES || "";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    accountAssociation: {
        header: ACCOUNT_HEADER,
        payload: ACCOUNT_PAYLOAD,
        signature: ACCOUNT_SIGNATURE,
    },
    baseBuilder: {
        allowedAddresses: ALLOWED_ADDRESSES_STRING.split(","),
    },
    miniapp: {
        version: "1",
        name: "BaseCard",
        homeUrl: ROOT_URL,
        iconUrl: `${ROOT_URL}/bc-icon.png`,
        splashImageUrl: `${ROOT_URL}/bc-icon.png`,
        splashBackgroundColor: "#ffffff",
        webhookUrl: `${ROOT_URL}/api/webhook`,
        subtitle: "Builder Identity on Base",
        description:
            "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        // screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
        primaryCategory: "social",
        tags: ["baseapp", "miniapp", "social", "identity", "earn"],
        heroImageUrl: `${ROOT_URL}/bc-hero.png`,
        // TODO: ...
        // tagline
        // ogTitle
        // ogDescription
        // ogImageUrl
        noindex: false,
    },
} as const;