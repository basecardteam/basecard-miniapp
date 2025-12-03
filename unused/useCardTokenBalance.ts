"use client";

import CARD_TOKEN_ABI_FULL from "@/lib/abi/CardToken.json";
import { getConfig } from "@/lib/wagmi";
import { updateBalanceAtom } from "@/store/tokenBalanceState";
import { walletAddressAtom } from "@/store/walletState";
import { formatAmount } from "@coinbase/onchainkit/token";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

const CARD_TOKEN_ADDRESS = process.env
    .NEXT_PUBLIC_CARD_TOKEN_ADDRESS! as `0x${string}`;
const CARD_TOKEN_DECIMALS = 18;

const abi = CARD_TOKEN_ABI_FULL.abi as Abi;
const wagmiConfig = getConfig();

/**
 * 연결된 계정의 CARD 토큰 잔액을 조회하고 포맷팅하는 커스텀 훅
 */
export function useCardTokenBalance() {
    const { isConnected } = useAccount();
    const [userAddress] = useAtom(walletAddressAtom);
    const setBalanceState = useSetAtom(updateBalanceAtom);

    // Read token balance for connected wallet
    const { data, isLoading, isError } = useReadContract({
        config: wagmiConfig,
        address: CARD_TOKEN_ADDRESS,
        abi: abi,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
        query: {
            enabled: !!userAddress && !!CARD_TOKEN_ADDRESS && isConnected,
            refetchInterval: 10000, // Refetch every 10 seconds
        },
    });


    const formattedResult = useMemo(() => {
        if (!isConnected || !userAddress) {
            return { balance: "0.00", isLoading: false, isError: false };
        }

        if (data === undefined) {
            return { balance: "0.00", isLoading: isLoading, isError: isError };
        }

        try {
            const amountString = formatUnits(
                data as bigint,
                CARD_TOKEN_DECIMALS
            );
            const balance = formatAmount(amountString, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
            });
            return { balance, isLoading: false, isError: false };
        } catch (e) {
            console.error("Failed to format token balance:", e);
            return { balance: "Error", isLoading: false, isError: true };
        }
    }, [data, isLoading, isError, userAddress, isConnected]);

    useEffect(() => {
        setBalanceState(formattedResult);
    }, [formattedResult, setBalanceState]);
}
