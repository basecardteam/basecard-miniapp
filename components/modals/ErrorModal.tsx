"use client";

import { BaseModal } from "./BaseModal";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export default function ErrorModal({
    isOpen,
    onClose,
    title = "Error Occurred",
    description = "Something went wrong. Please try again.",
    buttonText = "Close",
}: ErrorModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            buttonText={buttonText}
            variant="error"
        />
    );
}
