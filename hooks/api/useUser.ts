"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { BaseCard, User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

interface UseUserResult {
    user: User | null;
    card: BaseCard | null;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Custom hook to get user data with card included
 * 백엔드에서 user + card를 한 번에 반환
 */
export function useUser(): UseUserResult {
    const { accessToken, isAuthenticated, refreshAuth } = useAuth();
    const hasTriedRefresh = useRef(false);

    const query = useQuery<User | null, Error>({
        queryKey: ["user"],
        queryFn: async () => {
            if (!accessToken) {
                return null;
            }
            logger.debug("Fetching user data", {
                hasToken: !!accessToken,
            });
            try {
                const user = await fetchUser(accessToken);
                hasTriedRefresh.current = false; // Reset on success
                return user ?? null;
            } catch (error) {
                // 유저가 없으면 재로그인하여 유저 생성 트리거
                if (!hasTriedRefresh.current) {
                    logger.info(
                        "User not found, triggering refresh auth to create user..."
                    );
                    hasTriedRefresh.current = true;
                    await refreshAuth();
                }
                throw error;
            }
        },
        enabled: isAuthenticated && !!accessToken,
        staleTime: 0,
        refetchOnMount: true,
        retry: 1,
    });

    return {
        user: query.data ?? null,
        card: query.data?.card ?? null,
        isPending: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
