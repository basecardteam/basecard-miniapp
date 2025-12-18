export const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    accountAssociation: {
        header: "",
        payload: "",
        signature: "",
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
        // ogDescriptionaa
        // ogImageUrl
        noindex: false,

        // metadata in the layout
        embedImageUrl: `${ROOT_URL}/bc-embed-image.png`,
        buttonTitle: "Launch BaseCard",
    },
} as const;
