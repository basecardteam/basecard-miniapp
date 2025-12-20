"use client";

import { resolveIpfsUrl } from "@/lib/utils";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import Image, { StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CiEdit } from "react-icons/ci";

interface ProfileImagePreviewProps {
    profileImageFile: File | null;
    defaultProfileUrl: string | StaticImageData | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageClick: () => void;
}

const ProfileImagePreview = ({
    profileImageFile,
    defaultProfileUrl,
    fileInputRef,
    handleFileChange,
    handleImageClick,
}: ProfileImagePreviewProps) => {
    // 1. File 객체에 대한 Object URL 관리 (Memory Leak 방지)
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!profileImageFile) {
            setObjectUrl(null);
            return;
        }

        const url = URL.createObjectURL(profileImageFile);
        setObjectUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [profileImageFile]);

    // 2. 최종 표시할 이미지 URL 결정 (Memoization)
    const previewUrl = useMemo(() => {
        // A. 사용자가 새로 업로드한 파일이 있으면 최우선 사용
        if (objectUrl) return objectUrl;

        // B. 기존 프로필 URL이 있으면 사용 (IPFS 처리 포함)
        if (typeof defaultProfileUrl === "string") {
            const resolved = resolveIpfsUrl(defaultProfileUrl);
            return resolved || FALLBACK_PROFILE_IMAGE;
        }

        // C. StaticImageData 또는 null인 경우
        return defaultProfileUrl || FALLBACK_PROFILE_IMAGE;
    }, [objectUrl, defaultProfileUrl]);

    if (!previewUrl) return null;

    return (
        <div className="w-full space-y-3">
            <label className="text-lg font-semibold">Profile Image</label>
            <div className="flex items-center gap-4 relative">
                {/* 이미지 미리보기 및 편집 버튼 영역 */}
                <div
                    className="relative w-24 h-24 rounded-xl border overflow-hidden cursor-pointer"
                    onClick={handleImageClick}
                >
                    <Image
                        src={previewUrl}
                        alt="profile preview"
                        className="object-fill select-none"
                        fill={true}
                        style={{ objectFit: "cover" }}
                    />
                </div>
                <div className="absolute -bottom-4 left-[72px] w-11 h-11 flex items-center justify-center z-50 pointer-events-none">
                    <div className="p-1 bg-blue-500 rounded-full shadow-md">
                        <CiEdit className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* 실제 파일 input (숨김) */}
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden" // 파일 input을 숨깁니다.
                />
            </div>
        </div>
    );
};

export default ProfileImagePreview;
