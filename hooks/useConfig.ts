"use client";

import { AppConfigResult, fetchAppConfig } from "@/lib/api/config";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get app configuration including contract address, chain ID, and IPFS gateway.
 * Uses backend API with fallback to environment variables.
 */
export function useConfig() {
    const { data, isLoading, error } = useQuery<AppConfigResult>({
        queryKey: ["appConfig"],
        queryFn: fetchAppConfig,
        staleTime: 1000 * 60 * 60, // 1 hour - config rarely changes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1,
    });

    return {
        // Contract config
        contractAddress: data?.contractAddress,
        chainId: data?.chainId || process.env.NEXT_PUBLIC_BASECARD_CHAIN_ID,
        // IPFS config
        ipfsGatewayUrl: data?.ipfsGatewayUrl || "ipfs.io",
        // Loading state
        isLoading,
        error,
        // Raw data for debugging
        _apiData: data,
    };
}
