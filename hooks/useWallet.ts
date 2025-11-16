import { MOCK_WALLET_ADDRESS, USE_MOCK_DATA } from '@/lib/mockData';
import { walletAddressAtom } from '@/store/walletState';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useAccount } from "wagmi";

/**
 * Wagmi에서 현재 지갑 주소를 가져와 Jotai 아톰에 전역 상태로 저장하는 훅입니다.
 * 목업 모드일 때는 목업 지갑 주소를 반환합니다.
 */
export const useWallet = () => {
    const { address, isConnected } = useAccount();

    const setWalletAddress = useSetAtom(walletAddressAtom);

    useEffect(() => {
        if (USE_MOCK_DATA) {
            // 목업 모드: 항상 목업 지갑 주소 사용
            setWalletAddress(MOCK_WALLET_ADDRESS);
        } else if (isConnected && address) {
            // 실제 모드: 실제 지갑 주소 사용
            setWalletAddress(address);
        } else {
            setWalletAddress(undefined);
        }
    }, [address, isConnected, setWalletAddress]);

    // 목업 모드일 때는 목업 데이터 반환
    if (USE_MOCK_DATA) {
        return {
            address: MOCK_WALLET_ADDRESS,
            isConnected: true,
        };
    }

    return {
        address,
        isConnected
    }
};