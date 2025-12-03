import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

export function useUser(walletAddress?: string | null) {
    logger.debug("useUser hook called", { walletAddress });

    return useQuery<User, Error>({
        queryKey: ["user", walletAddress],
        queryFn: () => {
            logger.debug("Fetching user data", { walletAddress });
            return fetchUser(walletAddress!);
        },
        enabled: !!walletAddress,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30, // 30 seconds
        retry: 1,
    });
}
