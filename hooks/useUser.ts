import { fetchUser } from "@/lib/api/users";
import { logger } from "@/lib/common/logger";
import { User } from "@/lib/types/api";
import { walletAddressAtom } from "@/store/walletState";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

export function useUser() {
    const walletAddress = useAtomValue(walletAddressAtom);

    const query = useQuery<User, Error>({
        queryKey: ["user", walletAddress],
        queryFn: () => {
            logger.debug("Fetching user data", { walletAddress });
            return fetchUser(walletAddress!);
        },
        enabled: !!walletAddress,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    return query;
}
