"use client";

import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
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
    // // 1. 이미지 URL 결정 (로컬 파일 > 기본 URL > 폴백 이미지)
    // const profileImageUrl = profileImageFile
    //     ? URL.createObjectURL(profileImageFile)
    //     : defaultProfileUrl || FALLBACK_PROFILE_IMAGE;
    // 2. 메모리 누수 방지를 위한 Cleanup (useEffect를 Mint 컴포넌트에서 처리)
    const [previewUrl, setPreviewUrl] = useState<string | StaticImageData | null>(
        defaultProfileUrl || FALLBACK_PROFILE_IMAGE
    );

    // 💡 Local URL 생성 및 해제 로직을 Preview 컴포넌트 내부에서 처리
    useEffect(() => {
        if (profileImageFile) {
            // 1. 새 파일이 있으면 Blob URL 생성
            const url = URL.createObjectURL(profileImageFile);
            setPreviewUrl(url);

            // Cleanup: 컴포넌트 언마운트 또는 파일 변경 시 이전 URL 해제 (메모리 누수 방지)
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            // 2. 파일이 없으면 기본/폴백 URL 사용
            // defaultProfileUrl이 string일 경우 trim()으로 보이지 않는 문자 제거
            const cleanUrl = typeof defaultProfileUrl === 'string'
                ? defaultProfileUrl.trim()
                : defaultProfileUrl;

            setPreviewUrl(cleanUrl || FALLBACK_PROFILE_IMAGE);
        }
    }, [profileImageFile, defaultProfileUrl]);

    if (!previewUrl) return null; // 로딩 중이거나 URL이 결정되지 않았을 때 임시 처리
    // console.log('previewUrl', previewUrl)

    return (
        <div className="w-full space-y-3">
            <label className="text-lg font-medium">Profile Image</label>
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