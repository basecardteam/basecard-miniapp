import { useAuth } from "@/components/providers/AuthProvider";
import { fetchCollections } from "@/lib/api/collections";
import { logger } from "@/lib/common/logger";
import { Card } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useMyCollections() {
    const { isAuthenticated, accessToken } = useAuth();
    const { isConnected } = useAccount();

    return useQuery<Card[] | null, Error>({
        queryKey: ["collectedCards", isConnected],
        queryFn: () => {
            if (!accessToken) {
                logger.error(
                    "Failed to fetch collections: No access token found"
                );
                return null;
            }
            logger.debug("Fetching collections");
            const collections = fetchCollections(accessToken);
            return collections ?? null;
        },
        enabled: isAuthenticated && !!accessToken && isConnected,
    });
}
