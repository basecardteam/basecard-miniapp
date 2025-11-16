/**
 * ⚠️ SECURITY WARNING: SERVER-SIDE ONLY ⚠️
 *
 * This file contains Pinata JWT credentials and MUST ONLY be used in:
 * - API Routes (app/api/*)
 * - Server Components
 * - Server Actions
 *
 * ❌ NEVER import this file in:
 * - Client Components ("use client")
 * - Client-side hooks
 * - Browser code
 *
 * The Pinata JWT will be exposed to the browser if imported client-side!
 */

import type { IPFSUploadResponse } from "@/lib/types/api";
import { PinataSDK } from "pinata";

/**
 * Get Pinata SDK instance
 * Best practice: Singleton pattern with lazy initialization
 *
 * @throws Error if PINATA_JWT is not set (server-side env var)
 */
let pinataInstance: PinataSDK | null = null;

function getPinataSDK(): PinataSDK {
    // Runtime check: Ensure this is server-side
    if (typeof window !== "undefined") {
        throw new Error(
            "🚨 SECURITY ERROR: getPinataSDK() called on client-side! " +
            "This function must only be used in API routes or server components."
        );
    }

    if (!pinataInstance) {
        const jwt = process.env.PINATA_JWT;
        const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

        if (!jwt) {
            throw new Error(
                "PINATA_JWT environment variable is required. " +
                "Get it from https://app.pinata.cloud/developers/api-keys"
            );
        }

        pinataInstance = new PinataSDK({
            pinataJwt: jwt,
            pinataGateway: gateway,
        });
    }

    return pinataInstance;
}

/**
 * Delete (unpin) a file from IPFS via Pinata REST API
 * Use this to clean up failed mints or unwanted uploads
 */
export async function deleteFromIPFS(
    id: string
): Promise<{ success: boolean; error?: string }> {
    // Runtime check: Ensure this is server-side
    if (typeof window !== "undefined") {
        throw new Error(
            "🚨 SECURITY ERROR: deleteFromIPFS() called on client-side!"
        );
    }

    try {
        const pinata = getPinataSDK();

        // Unpin the file from Pinata
        await pinata.files.public.delete([id]);
        console.log(`🗑️ Deleted from IPFS: ${id}`);

        return { success: true };
    } catch (error) {
        console.error("❌ IPFS delete error:", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Unknown delete error",
        };
    }
}

/**
 * Upload SVG string to IPFS via Pinata SDK
 * Industry standard: Use official SDK for type safety and better DX
 */
export async function uploadBaseCardToIPFS(
    svgContent: string,
    metadata: {
        name: string;
    }
): Promise<IPFSUploadResponse> {
    try {
        const pinata = getPinataSDK();
        const group = process.env.PINATA_GROUP;
        if (!group) {
            throw new Error(
                "PINATA_GROUP environment variable is required. " +
                "Get it from https://app.pinata.cloud/developers/api-keys"
            );
        }
        // Convert SVG string to File
        // Best practice: Use proper MIME type and filename
        const fileName = `${metadata.name
            .replace(/\s+/g, "-")
            .toLowerCase()}.svg`;
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const file = new File([blob], fileName, {
            type: "image/svg+xml",
        });

        // Upload using Pinata SDK
        // SDK handles all the FormData, headers, and error handling internally
        const upload = await pinata.upload.public.file(file).group(group);
        const cid = upload.cid;
        const id = upload.id;
        const url = `https://ipfs.io/ipfs/${cid}`;
        console.log(`✅ SVG uploaded to IPFS: ${cid} at ${url}`);

        return {
            success: true,
            id,
            cid,
            url,
        };
    } catch (error) {
        console.error("❌ IPFS upload error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown IPFS upload error",
        };
    }
}
