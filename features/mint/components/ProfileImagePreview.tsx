"use client";

import { resolveIpfsUrl } from "@/lib/utils";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import Image, { StaticImageData } from "next/image";
import { useMemo } from "react";

interface ProfileImagePreviewProps {
    defaultProfileUrl: string | StaticImageData | null;
}

const ProfileImagePreview = ({
    defaultProfileUrl,
}: ProfileImagePreviewProps) => {
    const previewUrl = useMemo(() => {
        if (typeof defaultProfileUrl === "string") {
            const resolved = resolveIpfsUrl(defaultProfileUrl);
            return resolved || FALLBACK_PROFILE_IMAGE;
        }
        return defaultProfileUrl || FALLBACK_PROFILE_IMAGE;
    }, [defaultProfileUrl]);

    if (!previewUrl) return null;

    return (
        <div className="w-full space-y-3">
            <label className="text-lg font-semibold">Profile Image</label>
            <div className="flex items-center gap-4 relative">
                <div className="relative w-24 h-24 rounded-xl border overflow-hidden">
                    <Image
                        src={previewUrl}
                        alt="profile preview"
                        className="object-fill select-none"
                        fill={true}
                        style={{ objectFit: "cover" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileImagePreview;
