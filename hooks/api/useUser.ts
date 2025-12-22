import { useAuth } from "@/components/providers/AuthProvider";
import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export function useUser() {
    const { accessToken, isAuthenticated, refreshAuth } = useAuth();
    const hasTriedRefresh = useRef(false);

    const query = useQuery<User | null, Error>({
        queryKey: ["user", accessToken],
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
