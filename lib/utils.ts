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
