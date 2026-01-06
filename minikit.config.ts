export const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
export const BACKEND_API_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://api.basecard.org";

const AppName =
    process.env.NODE_ENV === "development" ? "BaseCard Dev" : "BaseCard";
const Indexing = process.env.NODE_ENV === "production";
/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    accountAssociation: {
        header:
            process.env.NEXT_PUBLIC_MINIAPP_ACCOUNT_ASSOCIATION_HEADER || "",
        payload:
            process.env.NEXT_PUBLIC_MINIAPP_ACCOUNT_ASSOCIATION_PAYLOAD || "",
        signature:
            process.env.NEXT_PUBLIC_MINIAPP_ACCOUNT_ASSOCIATION_SIGNATURE || "",
    },
    miniapp: {
        version: "1",
        name: AppName,
        iconUrl: `${ROOT_URL}/bc-icon.png`,
        homeUrl: `${ROOT_URL}`,
        imageUrl: `${ROOT_URL}/bc-icon.png`,
        buttonTitle: "Launch BaseCard",
        splashImageUrl: `${ROOT_URL}/bc-icon.png`,
        splashBackgroundColor: "#ffffff",
        webhookUrl: `${BACKEND_API_URL}/v1/webhook`,
        subtitle: "Builder Identity on Base",
        description:
            "Stop repeating your pitch. Mint your verified, onchain ID card, BaseCard! And, find people who share your interests.",
        primaryCategory: "social",
        heroImageUrl: `${ROOT_URL}/bc-hero.png`,
        ogImageUrl: `${ROOT_URL}/bc-ogimage.png`,
        ogTitle: AppName,
        tags: ["social", "basecard", "identity", "earn", "card"],
        embedImageUrl: `${ROOT_URL}/bc-ogimage.png`,
        screenshotUrls: [
            `${ROOT_URL}/screenshots/screenshot-start.png`,
            `${ROOT_URL}/screenshots/screenshot-collect.png`,
            `${ROOT_URL}/screenshots/screenshot-discover.png`,
        ],
        // if NODE_ENV is development, noindex is true
        noindex: !Indexing,
        // TODO: ...
        // tagline
        // ogDescriptionaa
        // metadata in the layout
    },
} as const;
