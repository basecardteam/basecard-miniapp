import { useAuth } from "@/components/providers/AuthProvider";
import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useUser() {
    const { address, isConnected } = useAccount();
    const { accessToken, isAuthenticated } = useAuth();

    const query = useQuery<User | null, Error>({
        queryKey: ["user", address, accessToken],
        queryFn: async () => {
            if (!address || !accessToken) {
                return null;
            }
            logger.debug("Fetching user data", {
                address,
                hasToken: !!accessToken,
            });
            const user = await fetchUser(address, accessToken);
            return user ?? null;
        },
        enabled: isConnected && !!address && isAuthenticated && !!accessToken, // Only fetch when authenticated AND token available
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
