"use client";

import { useCallback, useEffect, useState } from "react";

// import { generateCardShareQRCode } from "@/lib/qrCodeGenerator";
import { generateCardShareQRCode } from "@/lib/qrCodeGenerator";
import { Card } from "@/lib/types";
import BCLogo from "@/public/bc-icon.png";
import Image from "next/image";
import { IoClose } from "react-icons/io5";

// 모달 컴포넌트의 Props 타입 정의
interface CardShareModalProps {
    isVisible: boolean;
    onClose: () => void;
    card: Card;
}

/**
 * 명함 정보와 공유 QR 코드를 표시하는 모던하고 깔끔한 모달 컴포넌트입니다.
 */
export const CardShareModal: React.FC<CardShareModalProps> = ({ isVisible, onClose, card }) => {
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const [shouldRender, setShouldRender] = useState(isVisible);
    const [isMounted, setIsMounted] = useState(false);

    // IPFS Gateway URL (이전과 동일)
    const getIPFSUrl = (cid: string | undefined) => {
        if (!cid) return "/assets/default-profile.png";
        if (cid.startsWith("data:image")) return cid;
        return `https://ipfs.io/ipfs/${cid.replace("ipfs://", "")}`;
    };

    /** QR 코드 생성 로직 (색상 코드 활용) */
    const generateQRCode = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!card) return;

            const qrCode = await generateCardShareQRCode(card.id.toString(), {
                width: 250,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF00",
                },
            });
            setQrCodeDataURL(qrCode);
        } catch (error) {
            console.error("Failed to generate QR code:", error);
        } finally {
            setIsLoading(false);
        }
    }, [card, shouldRender, isMounted]);

    useEffect(() => {
        if (isVisible) {
            generateQRCode();
            setShouldRender(true);
            // 열림 애니메이션 시작
            setTimeout(() => setIsMounted(true), 10);
        } else {
            // 닫힘 애니메이션 시작
            setIsMounted(false);
            // 닫힘 애니메이션 (0.4s) 후 렌더링 중단 (스크롤 해제 트리거)
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [isVisible, card, generateQRCode]);

    if (!shouldRender) return null;

    // 모달 컨텐츠가 배경 클릭으로 닫히는 것을 방지
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const rootHeight = {
        minHeight: 'calc(100dvh - var(--header-h, 60px) - var(--bottom-nav-h, 64px))',
        paddingBottom: '40px'
    }

    const modalStyle: React.CSSProperties = {
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out', // transform과 opacity에 transition 적용
        marginBottom: 20,
        position: 'relative',
        backgroundColor: "#ffffff",
        // isMounted 상태에 따라 초기/최종 상태를 설정합니다.
        transform: isMounted ? 'translateY(0)' : 'translateY(100%)', // 'translate-y-0' -> 'translate-y-full'
        opacity: isMounted ? 1 : 0, // 'opacity-100' -> 'opacity-0'
    };

    const containerClasses = `
        w-full max-w-sm p-5 rounded-2xl shadow-2xl
    `;

    return (
        <div
            className="fixed inset-0 z-50 px-5 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={rootHeight}
            onClick={onClose}
        >
            {/* Modal Container: 플로팅 카드 디자인 */}
            <div
                className={containerClasses}
                onClick={handleModalClick}
                style={modalStyle}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="   rounded-full flex justify-center items-center"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0
                    }}
                    aria-label="닫기"
                >
                    <IoClose size={24} className="text-[#007aff]" />
                </button>

                {/* Header Section */}
                <div className="text-center mb-6 pt-2">
                    <div className="text-2xl font-bold " style={{
                        color: "#007aff"
                    }}>Share My Card</div>
                </div>

                {/* Profile Info Section (QR 위) */}
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shadow-xl">
                        {card && <Image
                            src={card.profileImage || getIPFSUrl(card.imageURI)}
                            alt={`${card.nickname}'s profile`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                        />}
                    </div>

                    <div className="text-center mt-5" style={{ color: "#007aff" }}>
                        <div className="flex gap-x-2 justify-center items-center">
                            <Image src={BCLogo} alt="share-logo" className="w-8 h-8" />
                            <div className="text-lg font-bold">{card?.nickname}</div>
                        </div>
                        {card?.role && (
                            <p className="text-sm font-semibold">{card.role}</p>
                        )}
                    </div>
                </div>

                <hr className="text-gary-100 bg-gray-500 h-0.5 my-5" />

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center">
                    {isLoading ? (
                        <div className="w-[220px] h-[220px] flex items-center justify-center bg-white rounded-lg">
                            {/* 로딩 스피너 (색상도 #0050FF 활용) */}
                            <svg className="animate-spin h-10 w-10 text-[#0050FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : qrCodeDataURL ? (
                        // QR Code Image
                        <img
                            src={qrCodeDataURL}
                            alt="Card Share QR Code"
                            className="w-full max-w-[220px] h-auto p-5" // 흰색 배경과 그림자로 플로팅 효과
                        />
                    ) : (
                        <div className="w-[220px] h-[220px] flex items-center justify-center text-red-500 border border-red-300 rounded-lg ">
                            QR 코드 생성 실패
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};