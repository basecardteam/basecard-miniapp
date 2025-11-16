/**
 * Image utility functions for BaseCard application
 * Handles image to base64 conversion and data URL generation
 */

/**
 * Convert base64 string and mime type to data URL format
 * @param base64 - Base64 encoded string
 * @param mimeType - Image mime type (e.g., 'image/png', 'image/jpeg')
 * @returns Data URL string (e.g., 'data:image/png;base64,...')
 */
export function imageToDataURL(base64: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert File object to base64 data URL
 * @param file - Image file to convert
 * @returns Promise that resolves to data URL string
 */
export async function convertFileToBase64DataURL(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString("base64");

    return imageToDataURL(imageBase64, file.type);
}

/**
 * Validate if file is a valid image type
 * @param file - File to validate
 * @returns true if valid image type
 */
export function isValidImageType(file: File): boolean {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    return validTypes.includes(file.type);
}

/**
 * Validate image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns true if file size is within limit
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): {
    valid: boolean;
    error?: string;
} {
    if (!isValidImageType(file)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload PNG or JPEG image.",
        };
    }

    if (!isValidImageSize(file)) {
        return {
            valid: false,
            error: "File size too large. Maximum size is 5MB.",
        };
    }

    return { valid: true };
}

/**
 * Safely convert imageURI to displayable URL
 * Handles various formats: ipfs://, http://, https://, data:image/...
 * @param imageURI - Image URI from database or API
 * @param fallbackUrl - Fallback URL if imageURI is invalid (default: null)
 * @returns Valid URL string or fallback URL
 */
export function safeImageURI(
    imageURI: string | null | undefined,
    fallbackUrl: string | null = null
): string | null {
    // Handle null, undefined, or empty string
    if (!imageURI || typeof imageURI !== "string" || imageURI.trim() === "") {
        return fallbackUrl;
    }

    const uri = imageURI.trim();

    try {
        // Handle IPFS URIs
        if (uri.startsWith("ipfs://")) {
            const cid = uri.replace("ipfs://", "");
            // Validate CID is not empty
            if (!cid) {
                return fallbackUrl;
            }
            return `https://ipfs.io/ipfs/${cid}`;
        }

        // Handle data URLs (base64 encoded images)
        if (uri.startsWith("data:image/")) {
            // Basic validation for data URL format
            if (uri.includes("base64,")) {
                return uri;
            }
            return fallbackUrl;
        }

        // Handle HTTP/HTTPS URLs
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
            // Optional: Validate URL format
            try {
                new URL(uri);
                return uri;
            } catch {
                return fallbackUrl;
            }
        }

        // Handle relative paths or other formats
        // If it looks like a path, return it
        if (uri.startsWith("/")) {
            return uri;
        }

        // Unknown format, return fallback
        return fallbackUrl;
    } catch (error) {
        console.error("Error processing imageURI:", error);
        return fallbackUrl;
    }
}

/**
 * Check if imageURI is valid (non-null and processable)
 * @param imageURI - Image URI to validate
 * @returns true if valid, false otherwise
 */
export function isValidImageURI(imageURI: string | null | undefined): boolean {
    return safeImageURI(imageURI) !== null;
}
