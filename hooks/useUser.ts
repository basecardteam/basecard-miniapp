import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useUser() {
    const { address, isConnected } = useAccount();

    const query = useQuery<User | null, Error>({
        queryKey: ["user", address],
        queryFn: async () => {
            if (!address) {
                return null;
            }
            logger.debug("Fetching user data", { address });
            const user = await fetchUser(address);
            return user ?? null;
        },
        enabled: isConnected && !!address,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
