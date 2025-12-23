"use client";

import { useUser } from "@/hooks/api/useUser";
import { BaseCard } from "@/lib/types/api";

/**
 * Custom hook to get user's card data
 * useUser에서 반환하는 card 데이터를 사용
 * 기존 useMyBaseCard 인터페이스와 호환
 */
export function useMyBaseCard(): {
    data: BaseCard | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
} {
    const { card, isPending, isError, error } = useUser();

    return {
        data: card,
        isLoading: isPending,
        isPending,
        isError,
        error,
    };
}
