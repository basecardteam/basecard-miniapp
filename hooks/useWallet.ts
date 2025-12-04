import { MOCK_WALLET_ADDRESS, USE_MOCK_DATA } from "@/lib/legacy/mockData";
import { walletAddressAtom } from "@/store/walletState";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useAccount } from "wagmi";

/**
 * Wagmi에서 현재 지갑 주소를 가져와 Jotai 아톰에 전역 상태로 저장하는 훅입니다.
 * 목업 모드일 때는 목업 지갑 주소를 반환합니다.
 */
export const useWallet = () => {
    const { address: wagmiAddress, isConnected: isWagmiConnected } =
        useAccount();
    const setWalletAddress = useSetAtom(walletAddressAtom);
    const address = useAtomValue(walletAddressAtom);

    useEffect(() => {
        if (USE_MOCK_DATA) {
            // 목업 모드: 항상 목업 지갑 주소 사용
            setWalletAddress(MOCK_WALLET_ADDRESS);
        } else if (isWagmiConnected && wagmiAddress) {
            // 실제 모드: 실제 지갑 주소 사용
            setWalletAddress(wagmiAddress);
        } else {
            setWalletAddress(undefined);
        }
    }, [wagmiAddress, isWagmiConnected, setWalletAddress]);

    return {
        address,
        isConnected: !!address,
    };
};
