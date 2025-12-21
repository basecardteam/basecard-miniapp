import { getIPFSUrl } from "@/lib/utils";

/**
 * URL에서 이미지를 가져와 File 객체로 변환
 * @param imageUrl - 이미지 URL (IPFS 또는 일반 URL)
 * @returns Promise<File> - 변환된 File 객체
 */
export async function fetchImageAsFile(imageUrl: string): Promise<File> {
    const resolvedUrl = imageUrl.startsWith("ipfs://")
        ? getIPFSUrl(imageUrl)
        : imageUrl;

    const response = await fetch(resolvedUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = imageUrl.split("/").pop() || "profile-image.png";
    const mimeType = blob.type || "image/png";

    return new File([blob], filename, { type: mimeType });
}

/**
 * 프로필 이미지를 File 객체로 처리
 * - 새 파일이 있으면 그대로 반환
 * - 없으면 기존 URL에서 가져와서 File로 변환
 */
export async function processProfileImage(
    newFile: File | null | undefined,
    existingImageUrl: string | null | undefined,
    defaultImageUrl: string
): Promise<File> {
    // 새 파일이 있으면 그대로 사용
    if (newFile) {
        return newFile;
    }

    // 기존 이미지 URL이 있으면 fetch해서 File로 변환
    if (existingImageUrl) {
        return fetchImageAsFile(existingImageUrl);
    }

    // 둘 다 없으면 기본 이미지 사용
    return fetchImageAsFile(defaultImageUrl);
}
