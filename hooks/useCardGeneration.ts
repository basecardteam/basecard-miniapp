"use client";

import type {
    CardGenerationData,
    CardGenerationResponse,
} from "@/lib/types/api";
import { useCallback, useState } from "react";

// Hook에서 사용하는 Result 타입은 API Response와 동일
export type CardGenerationResult = CardGenerationResponse;

/**
 * React hook for card generation with state management
 */
export function useCardGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CardGenerationResult | null>(null);

    const generateCard = useCallback(
        async (
            data: CardGenerationData,
            uploadToIpfs: boolean = false
        ): Promise<CardGenerationResult> => {
            setIsGenerating(true);
            setError(null);
            setResult(null);

            try {
                // Create FormData
                const formData = new FormData();
                formData.append("nickname", data.name);
                formData.append("role", data.role);
                formData.append("basename", data.baseName);
                formData.append("profileImage", data.profileImage);
                formData.append("uploadToIpfs", uploadToIpfs.toString());

                // Call API
                const response = await fetch("/api/generate", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to generate card"
                    );
                }

                // API는 항상 JSON으로 응답 (타입 일관성)
                const responseData = await response.json();

                const generationResult: CardGenerationResult = {
                    success: responseData.success,
                    svg: responseData.svg,
                    ipfs: responseData.ipfs, // { cid, url } 또는 undefined
                    profileImageBase64: responseData.profileImageBase64,
                };

                setResult(generationResult);
                return generationResult;
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Unknown error occurred";
                setError(errorMessage);

                const errorResult: CardGenerationResult = {
                    success: false,
                    error: errorMessage,
                };
                setResult(errorResult);
                return errorResult;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setIsGenerating(false);
        setError(null);
        setResult(null);
    }, []);

    return {
        generateCard,
        isGenerating,
        error,
        result,
        reset,
    };
}

/**
 * Validate card generation data before submission
 */
export function validateCardData(data: Partial<CardGenerationData>): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!data.name?.trim()) {
        errors.push("Name is required");
    }

    if (!data.role?.trim()) {
        errors.push("Role is required");
    }

    if (!data.profileImage) {
        errors.push("Profile image is required");
    } else {
        // Validate file type
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(data.profileImage.type)) {
            errors.push("Profile image must be PNG or JPEG");
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (data.profileImage.size > maxSize) {
            errors.push("Profile image must be less than 5MB");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
