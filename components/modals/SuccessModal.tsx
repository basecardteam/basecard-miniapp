"use client";

import { BaseModal } from "./BaseModal";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title = "Success",
    description = "Operation completed successfully.",
    buttonText = "Okay",
}: SuccessModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            buttonText={buttonText}
            variant="success"
        />
    );
}
