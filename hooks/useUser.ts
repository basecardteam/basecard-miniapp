import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useUser() {
    const { address, isConnected } = useAccount();

    const query = useQuery<User, Error>({
        queryKey: ["user", address],
        queryFn: () => {
            logger.debug("Fetching user data", { address });
            return fetchUser(address!);
        },
        enabled: isConnected,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
