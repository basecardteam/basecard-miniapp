"use client";

import ShareModal from "@/components/modals/ShareModal";
import { useFrameContext } from "@/components/providers/FrameProvider";
import { generateCardShareQRCode } from "@/lib/qrCodeGenerator";
import { Card } from "@/lib/types";
import BCLogo from "@/public/bc-icon.png";
import { MiniAppContext } from "@farcaster/miniapp-core/dist/context";
import { useCallback, useEffect, useState } from "react";

interface CardShareModalProps {
    isVisible: boolean;
    onClose: () => void;
    card: Card;
}

/**
 * Card-specific share modal that wraps the reusable ShareModal component.
 * Handles QR code generation and card data mapping.
 */
export const CardShareModal: React.FC<CardShareModalProps> = ({
    isVisible,
    onClose,
    card,
}) => {
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const frameContext = useFrameContext();
    const user = (frameContext?.context as MiniAppContext)?.user;
    /** Generate QR code when modal opens */
    const generateQRCode = useCallback(async () => {
        if (!card || !isVisible) return;

        setIsLoading(true);
        try {
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
            setQrCodeDataURL("");
        } finally {
            setIsLoading(false);
        }
    }, [card, isVisible]);

    useEffect(() => {
        if (isVisible) {
            generateQRCode();
        }
    }, [isVisible, generateQRCode]);

    return (
        <ShareModal
            isOpen={isVisible}
            onClose={onClose}
            title="Share My Card"
            profileImageUrl={user?.pfpUrl??undefined}
            name={card?.nickname || undefined}
            subtitle={card?.role || undefined}
            qrCodeDataURL={qrCodeDataURL}
            isLoadingQR={isLoading}
            qrErrorMessage="QR 코드 생성 실패"
            logoSrc={BCLogo.src}
            buttonText="Close"
        />
    );
};

export default CardShareModal;
