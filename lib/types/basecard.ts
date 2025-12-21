// Allowed social keys
export const SOCIAL_KEYS = [
    "twitter",
    "farcaster",
    "website",
    "github",
    "linkedin",
    "basename",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type Socials = Partial<Record<SocialKey, string>>;
