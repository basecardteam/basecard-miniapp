/**
 * Process image from File or URL
 * If input is a File, returns it as-is
 * If input is a URL string or object with src, fetches and returns as File
 */
export async function processProfileImage(
    profileImageFile?: File,
    defaultProfileUrl?: string | { src: string }
): Promise<File | null> {
    try {
        if (profileImageFile) {
            return profileImageFile;
        }

        if (defaultProfileUrl) {
            const urlString =
                typeof defaultProfileUrl === "object" &&
                "src" in defaultProfileUrl
                    ? defaultProfileUrl.src
                    : String(defaultProfileUrl);

            const response = await fetch(urlString);
            const blob = await response.blob();
            return new File([blob], "profile-image.png", {
                type: blob.type || "image/png",
            });
        }

        return null;
    } catch (error) {
        console.error("Error processing image:", error);
        return null;
    }
}
