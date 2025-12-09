import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// IPFS Gateway URL
export const getIPFSUrl = (cid: string | undefined | null) => {
    if (!cid) return "/assets/default-profile.png";
    if (cid.startsWith("data:image")) return cid;
    return `https://ipfs.io/ipfs/${cid.replace("ipfs://", "")}`;
};

export const METADATA = {
    name: "BaseCard Mini App Dev",
    description: "A demo mini app for testing capabilities on Base",
    bannerImageUrl: "https://i.imgur.com/2bsV8mV.png",
    iconImageUrl: "https://i.imgur.com/brcnijg.png",
    // homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://frames-v2-demo-lilac.vercel.app",
    homeUrl: "https://frames-v2-demo-lilac.vercel.app",
    splashBackgroundColor: "#FFFFFF",
};
