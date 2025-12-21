"use client";

import BaseButton from "@/components/buttons/BaseButton";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

type ModalVariant = "success" | "error" | "default";

interface ModalState {
    isOpen: boolean;
    title: string;
    description: string;
    buttonText: string;
    variant: ModalVariant;
    onButtonClick?: () => void;
    linkText?: string;
    onLinkClick?: () => void;
}

interface ShowModalOptions {
    title: string;
    description: string;
    buttonText?: string;
    variant?: ModalVariant;
    onButtonClick?: () => void;
    linkText?: string;
    onLinkClick?: () => void;
}

const initialState: ModalState = {
    isOpen: false,
    title: "",
    description: "",
    buttonText: "Okay",
    variant: "default",
};

// Jotai atom for modal state
const modalAtom = atom<ModalState>(initialState);

// Hook to control modal
export function useModal() {
    const setModal = useSetAtom(modalAtom);

    const showModal = useCallback(
        (options: ShowModalOptions) => {
            setModal({
                isOpen: true,
                title: options.title,
                description: options.description,
                buttonText: options.buttonText || "Okay",
                variant: options.variant || "default",
                onButtonClick: options.onButtonClick,
                linkText: options.linkText,
                onLinkClick: options.onLinkClick,
            });
        },
        [setModal]
    );

    const closeModal = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    }, [setModal]);

    return { showModal, closeModal };
}

// Modal Container (place once in app via providers)
export function ModalContainer() {
    const [modal, setModal] = useAtom(modalAtom);

    const handleClose = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    }, [setModal]);

    if (!modal.isOpen) return null;

    const titleColor = {
        success: "text-[#007aff]",
        error: "text-red-400",
        default: "text-[#60A5FA]",
    }[modal.variant];

    const handleButtonClick = () => {
        if (modal.onButtonClick) {
            modal.onButtonClick();
        }
        handleClose();
    };

    return (
        <div
            className={`fixed inset-0 z-[999] flex flex-col items-center justify-center ${
                modal.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            } transition-opacity duration-300 `}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Content */}
            <div
                className={`relative w-full h-full flex flex-col items-center justify-center p-5
                    transform transition-all duration-300 ease-out
                    text-white max-w-sm text-center
                    ${
        modal.isOpen
            ? "scale-100 translate-y-0"
            : "scale-95 translate-y-4"
        }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col justify-center items-center mt-auto">
                    {/* Title */}
                    <h2
                        className={`text-2xl font-extrabold mb-3 leading-snug ${titleColor}`}
                    >
                        {modal.title}
                    </h2>

                    {/* Description */}
                    <p className="text-base font-medium text-gray-300 mb-6 whitespace-pre-line">
                        {modal.description}
                    </p>

                    {/* Optional Link */}
                    {modal.linkText && modal.onLinkClick && (
                        <button
                            onClick={modal.onLinkClick}
                            className="flex items-center gap-1 border-b border-[#60A5FA] pb-0.5 mb-6 hover:opacity-80 transition-opacity"
                        >
                            <span className="text-sm font-semibold text-[#60A5FA]">
                                {modal.linkText}
                            </span>
                            <span className="text-xs text-[#60A5FA]">→</span>
                        </button>
                    )}
                </div>
                {/* Primary Button */}
                <BaseButton
                    onClick={handleButtonClick}
                    className="mt-auto w-full h-14 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-base font-semibold"
                    style={{ marginBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
                >
                    {modal.buttonText}
                </BaseButton>
            </div>
        </div>
    );
}

// Legacy component for backwards compatibility
interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    buttonText?: string;
    variant?: ModalVariant;
    onButtonClick?: () => void;
    linkText?: string;
    onLinkClick?: () => void;
}

export const BaseModal = ({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "Okay",
    variant = "default",
    onButtonClick,
    linkText,
    onLinkClick,
}: BaseModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    const titleColor = {
        success: "text-[#60A5FA]",
        error: "text-red-400",
        default: "text-[#60A5FA]",
    }[variant];

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Content */}
            <div
                className={`relative w-full h-full flex flex-col items-center justify-center p-8
                    transform transition-all duration-300 ease-out
                    text-white max-w-sm text-center
                    ${
        isOpen
            ? "scale-100 translate-y-0"
            : "scale-95 translate-y-4"
        }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h2
                    className={`text-2xl font-extrabold mb-3 leading-snug ${titleColor}`}
                >
                    {title}
                </h2>

                {/* Description */}
                <p className="text-base font-medium text-gray-300 mb-6 whitespace-pre-line">
                    {description}
                </p>

                {/* Optional Link */}
                {linkText && onLinkClick && (
                    <button
                        onClick={onLinkClick}
                        className="flex items-center gap-1 border-b border-[#60A5FA] pb-0.5 mb-6 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-sm font-semibold text-[#60A5FA]">
                            {linkText}
                        </span>
                        <span className="text-xs text-[#60A5FA]">→</span>
                    </button>
                )}

                {/* Primary Button */}
                <BaseButton
                    onClick={onButtonClick || onClose}
                    className="max-w-[280px] absolute w-full h-12 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-base font-semibold"
                    style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
                >
                    {buttonText}
                </BaseButton>
            </div>
        </div>
    );
};
