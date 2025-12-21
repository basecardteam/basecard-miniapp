// src/components/miniapp/CardCollectionAdder.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ErrorModal from "@/components/modals/ErrorModal";
import LoadingModal from "@/components/modals/LoadingModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useMyBaseCard } from "@/hooks/api/useMyBaseCard";
import { addCollection } from "@/lib/api/collections";

interface CardCollectionAdderProps {
    collectedCardId: string; // Wallet address of the card owner to collect
}

export default function CardCollectionAdder({
    collectedCardId,
}: CardCollectionAdderProps) {
    const router = useRouter();
    const { isAuthenticated, accessToken } = useAuth();
    const { address } = useAccount();
    const { data: myCard, isLoading: isCardLoading } = useMyBaseCard();
    const { showToast } = useToast();

    const [isConfirmDismissed, setIsConfirmDismissed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isErrorDismissed, setIsErrorDismissed] = useState(false);

    // -------------------------------------------------------------
    // 1. Compute state at render time
    // -------------------------------------------------------------
    const validationError = (() => {
        if (isCardLoading) return null;
        if (!address) return "Please connect your wallet to collect this card.";
        if (!myCard?.id) return "Card not found. Please mint your card first.";
        if (address.toLowerCase() === collectedCardId.toLowerCase()) {
            return "You cannot collect your own card.";
        }
        return null;
    })();

    const showConfirmModal =
        !isCardLoading &&
        !validationError &&
        !isConfirmDismissed &&
        !isProcessing;
    const showErrorModal =
        !isCardLoading && !!validationError && !isErrorDismissed;

    // -------------------------------------------------------------
    // 2. Collection logic (executed when confirm is clicked)
    // -------------------------------------------------------------
    const handleCollect = useCallback(async () => {
        setIsConfirmDismissed(true);

        if (!address || !myCard?.id) {
            return;
        }

        if (!isAuthenticated || !accessToken) {
            showToast(
                "Please connect your wallet to collect this card.",
                "error"
            );
            return;
        }

        setIsProcessing(true);

        try {
            await addCollection(accessToken, collectedCardId);

            setIsProcessing(false);
            showToast("Card collected successfully!", "success");
            router.replace("/");
        } catch (err: unknown) {
            setIsProcessing(false);

            const errorMessage =
                err instanceof Error ? err.message : "Failed to collect card.";
            if (errorMessage.includes("already exists")) {
                showToast("You have already collected this card.", "error");
            } else {
                showToast(errorMessage, "error");
            }
            router.replace("/");
        }
    }, [address, myCard?.id, collectedCardId, router, showToast]);

    // -------------------------------------------------------------
    // 3. UX helper functions
    // -------------------------------------------------------------
    const handleCancel = useCallback(() => {
        setIsConfirmDismissed(true);
        router.replace("/");
    }, [router]);

    const handleCloseError = useCallback(() => {
        setIsErrorDismissed(true);
        router.replace("/");
    }, [router]);

    // -------------------------------------------------------------
    // 4. Modal rendering
    // -------------------------------------------------------------
    return (
        <>
            {/* A. Loading modal */}
            <LoadingModal
                isOpen={isCardLoading || isProcessing}
                title={
                    isCardLoading ? "Checking profile..." : "Collecting card..."
                }
                description={
                    isCardLoading
                        ? "Verifying your card information."
                        : "Adding to your collection."
                }
            />

            {/* B. Collection confirmation modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onConfirm={handleCollect}
                onCancel={handleCancel}
                title="Collect Card"
                description="Would you like to add this card to your collection?"
                confirmText="Collect"
            />

            {/* C. Error modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={handleCloseError}
                title="Collection Error"
                description={validationError || "An unknown error occurred."}
            />
        </>
    );
}
