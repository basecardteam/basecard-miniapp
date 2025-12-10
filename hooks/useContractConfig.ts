"use client";

import { useQuery } from "@tanstack/react-query";

interface ContractConfig {
    contractAddress: string;
    chainId: number;
}

/**
 * Fetches contract configuration from the backend API.
 * Falls back to environment variables if the API call fails.
 */
import { fetchAppConfig, AppConfigResult } from "@/lib/api/config";

async function fetchContractConfig(): Promise<AppConfigResult> {
    return fetchAppConfig();
}

/**
 * Hook to get contract configuration.
 * Uses backend API with fallback to environment variables.
 */
export function useContractConfig() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["contractConfig"],
        queryFn: fetchContractConfig,
        staleTime: 1000 * 60 * 60, // 1 hour - config rarely changes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1,
    });

    // Use API data or fallback to env vars
    const contractAddress =
        data?.contractAddress ||
        process.env.NEXT_PUBLIC_BASECARD_CONTRACT_ADDRESS;
    const chainId = data?.chainId || process.env.NEXT_PUBLIC_BASECARD_CHAIN_ID;

    return {
        contractAddress,
        chainId,
        isLoading,
        error,
        // Expose raw data for debugging
        _apiData: data,
        _usingFallback: !data,
    };
}
