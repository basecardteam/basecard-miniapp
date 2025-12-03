import { ACTION_ADD_CARD } from "@/app/constants/actions";
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
export function generateCardShareURL(cardId: string): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    console.log(
        "generated share URL",
        `${baseUrl}?action=${ACTION_ADD_CARD}&id=${cardId}`
    );

    return `${baseUrl}?action=${ACTION_ADD_CARD}&id=${cardId}`;
}

/**
 * Generate QR code for BaseCard sharing
 */
export async function generateCardShareQRCode(
    cardId: string,
    options?: QRCodeOptions
): Promise<string> {
    const shareURL = generateCardShareURL(cardId);
    return generateQRCodeDataURL(shareURL, options);
}
