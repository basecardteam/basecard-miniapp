"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BaseModal } from "@/components/modals/BaseModal";
import LoadingModal from "@/components/modals/LoadingModal";
import ErrorModal from "@/components/modals/ErrorModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";
import { SocialsVerificationModal } from "@/components/modals/SocialsVerificationModal";
import ShareModal from "@/components/modals/ShareModal";

type ModalType =
    | "loading"
    | "success"
    | "error"
    | "warning"
    | "confirmation"
    | "alertDefault"
    | "alertSuccess"
    | "alertError"
    | "successModal"
    | "socialsVerification"
    | "share"
    | null;

const isDev = process.env.NODE_ENV === "development";

export default function DevDesignPage() {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Redirect to home if not in development mode
    useEffect(() => {
        if (!isDev) {
            router.replace("/");
        }
    }, [router]);

    // Don't render in production
    if (!isDev) {
        return null;
    }

    const openModal = (type: ModalType) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    const modalButtons: { type: ModalType; label: string; color: string }[] = [
        { type: "loading", label: "Loading Modal", color: "bg-blue-500" },
        { type: "successModal", label: "Success Modal", color: "bg-green-500" },
        { type: "error", label: "Error Modal", color: "bg-red-500" },
        {
            type: "confirmation",
            label: "Confirmation Modal",
            color: "bg-purple-500",
        },
        {
            type: "socialsVerification",
            label: "Socials Verification",
            color: "bg-orange-500",
        },
        { type: "share", label: "Share Modal", color: "bg-pink-500" },
        {
            type: "alertDefault",
            label: "BaseModal (Default)",
            color: "bg-basecard-blue",
        },
        {
            type: "alertSuccess",
            label: "BaseModal (Success)",
            color: "bg-green-600",
        },
        { type: "alertError", label: "BaseModal (Error)", color: "bg-red-600" },
    ];

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-basecard-black mb-2">
                    🎨 Design System Preview
                </h1>
                <p className="text-basecard-gray mb-8">
                    Click buttons to preview each modal component
                </p>

                {/* Modal Buttons Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {modalButtons.map(({ type, label, color }) => (
                        <button
                            key={type}
                            onClick={() => openModal(type)}
                            className={`${color} text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-md`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Color Palette Preview */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-basecard-black mb-4">
                        BaseCard Color Palette
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-basecard-blue rounded-lg shadow-md" />
                            <span className="text-sm mt-2 text-basecard-gray">
                                Blue
                            </span>
                            <span className="text-xs text-gray-400">
                                #0050FF
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-basecard-black rounded-lg shadow-md" />
                            <span className="text-sm mt-2 text-basecard-gray">
                                Black
                            </span>
                            <span className="text-xs text-gray-400">
                                #303030
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-basecard-gray rounded-lg shadow-md" />
                            <span className="text-sm mt-2 text-basecard-gray">
                                Gray
                            </span>
                            <span className="text-xs text-gray-400">
                                #62748D
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-basecard-white rounded-lg shadow-md border" />
                            <span className="text-sm mt-2 text-basecard-gray">
                                White
                            </span>
                            <span className="text-xs text-gray-400">
                                #F0F0F0
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {/* Loading Modal - Click backdrop to close in dev mode */}
            {activeModal === "loading" && (
                <div onClick={closeModal} className="cursor-pointer">
                    <LoadingModal
                        isOpen={true}
                        title="Creating Your Card..."
                        description="We're designing your unique BaseCard (click anywhere to close)"
                    />
                </div>
            )}

            <ErrorModal
                isOpen={activeModal === "error"}
                onClose={closeModal}
                title="Minting Failed"
                description="Failed to create card. Please try again."
            />

            <ConfirmationModal
                isOpen={activeModal === "confirmation"}
                onConfirm={() => {
                    alert("Confirmed!");
                    closeModal();
                }}
                onCancel={closeModal}
                title="Confirm Action"
                description="Are you sure you want to proceed?"
                confirmText="Yes, proceed"
            />

            <BaseModal
                isOpen={activeModal === "alertDefault"}
                onClose={closeModal}
                title="Default Alert"
                description="This is a default alert modal."
                variant="default"
            />

            <BaseModal
                isOpen={activeModal === "alertSuccess"}
                onClose={closeModal}
                title="Success!"
                description="Your action was completed successfully."
                variant="success"
            />

            <BaseModal
                isOpen={activeModal === "alertError"}
                onClose={closeModal}
                title="Error Occurred"
                description="Something went wrong. Please try again."
                variant="error"
            />

            <SuccessModal
                isOpen={activeModal === "successModal"}
                onClose={closeModal}
                title="Success!"
                description="Your action was completed successfully."
            />

            <SocialsVerificationModal
                isOpen={activeModal === "socialsVerification"}
                onClose={closeModal}
                socials={{
                    x: { handle: "testuser", verified: false },
                    github: { handle: "testdev", verified: true },
                    linkedin: { handle: "testpro", verified: false },
                }}
            />

            <ShareModal
                isOpen={activeModal === "share"}
                onClose={closeModal}
                title="Share My Card"
                name="Test User"
                subtitle="Frontend Developer"
            />
        </main>
    );
}
