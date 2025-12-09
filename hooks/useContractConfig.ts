"use client";

import { useQuery } from "@tanstack/react-query";
import { config } from "@/lib/common/config";

interface ContractConfig {
    contractAddress: string;
    chainId: number;
}

const FALLBACK_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_BASECARD_CONTRACT_ADDRESS ?? "";
const FALLBACK_CHAIN_ID = 84532; // Base Sepolia

/**
 * Fetches contract configuration from the backend API.
 * Falls back to environment variables if the API call fails.
 */
async function fetchContractConfig(): Promise<ContractConfig> {
    const response = await fetch(`${config.BACKEND_API_URL}/v1/config`);

    if (!response.ok) {
        throw new Error("Failed to fetch contract config");
    }

    return response.json();
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
    const contractAddress = data?.contractAddress || FALLBACK_CONTRACT_ADDRESS;
    const chainId = data?.chainId || FALLBACK_CHAIN_ID;

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
