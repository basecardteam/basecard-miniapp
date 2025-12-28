import { ACTION_ADD_CARD } from "@/lib/constants/actions";
import { ROOT_URL } from "@/minikit.config";
import QRCode from "qrcode";

export interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataURL(
    text: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const defaultOptions = {
        width: 200,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
        ...options,
    };

    try {
        const dataURL = await QRCode.toDataURL(text, defaultOptions);
        return dataURL;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
    text: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const defaultOptions = {
        width: 200,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
        ...options,
    };

    try {
        const svg = await QRCode.toString(text, {
            type: "svg",
            ...defaultOptions,
        });
        return svg;
    } catch (error) {
        console.error("Error generating QR code SVG:", error);
        throw new Error("Failed to generate QR code SVG");
    }
}

/**
 * Generate a shareable URL for a BaseCard
 */
export function generateBaseCardShareURL(cardId: string): string {
    return `${ROOT_URL}/share/${cardId}`;
}

/**
 * Generate a collectable URL for a BaseCard
 */
export function generateBaseCardCollectURL(cardId: string): string {
    const deepLink = `cbwallet://miniapp?url=${ROOT_URL}?action=${ACTION_ADD_CARD}&id=${cardId}`;
    console.log("generated share URL", deepLink);
    return deepLink;
}

/**
 * Generate QR code for BaseCard collect
 */
export async function generateBaseCardCollectQRCode(
    cardId: string,
    options?: QRCodeOptions
): Promise<string> {
    const shareURL = generateBaseCardCollectURL(cardId);
    return generateQRCodeDataURL(shareURL, options);
}
