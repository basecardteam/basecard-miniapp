import { useAuth } from "@/components/providers/AuthProvider";
import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
    const { accessToken, isAuthenticated } = useAuth();

    const query = useQuery<User | null, Error>({
        queryKey: ["user", accessToken],
        queryFn: async () => {
            if (!accessToken) {
                return null;
            }
            logger.debug("Fetching user data", {
                hasToken: !!accessToken,
            });
            const user = await fetchUser(accessToken);
            return user ?? null;
        },
        enabled: isAuthenticated && !!accessToken,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
