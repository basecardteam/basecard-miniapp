"use client";

import { Socials } from "@/lib/types/api";
import { useRouter } from "next/navigation";

interface SocialsVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    socials?: Socials | null;
}

/**
 * 미인증 소셜 계정이 있을 경우 표시되는 공지 모달
 * ConfirmationModal 스타일로 간결하게 구현
 */
export function SocialsVerificationModal({
    isOpen,
    onClose,
    socials,
}: SocialsVerificationModalProps) {
    const router = useRouter();

    // 미인증 소셜 목록 계산
    const unverifiedSocials = socials
        ? Object.entries(socials)
              .filter(([, entry]) => entry && entry.handle && !entry.verified)
              .map(([key]) => key)
        : [];

    if (!isOpen) return null;

    const handleVerifyNow = () => {
        router.push("/edit-profile");
        onClose();
    };

    const socialLabels: Record<string, string> = {
        x: "X",
        github: "GitHub",
        linkedin: "LinkedIn",
        farcaster: "Farcaster",
        basename: "Basename",
        website: "Website",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-80 bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center"
                style={{
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                }}
            >
                {/* Title and Description */}
                <div className="text-center mb-4 w-full">
                    <h2 className="text-xl font-k2d font-bold text-gray-800 mb-2">
                        ⚠️ Verify Your Socials
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed px-1">
                        Please verify your social accounts to build trusted
                        connections on BaseCard.
                    </p>
                </div>

                {/* Unverified List */}
                {unverifiedSocials.length > 0 && (
                    <div className="w-full mb-5">
                        <div className="flex flex-wrap justify-center gap-2">
                            {unverifiedSocials.map((key) => (
                                <span
                                    key={key}
                                    className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                                >
                                    {socialLabels[key] || key}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex w-full space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={handleVerifyNow}
                        className="flex-1 py-3 rounded-lg bg-[#0050FF] text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Verify Now
                    </button>
                </div>
            </div>
        </div>
    );
}
