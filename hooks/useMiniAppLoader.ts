"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { MOCK_USER_PROFILE, USE_MOCK_DATA } from "@/lib/legacy/mockData";
import { updateProfileAtom } from "@/store/userProfileState";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "./useUser";
import { useWallet } from "./useWallet";

interface MiniAppLoaderResult {
    isInMiniApp: boolean;
    isFinishedLoading: boolean;
}

const INITIAL_LOAD_TIMEOUT = 500; // 0.5초 후 강제 완료

/**
 * Base Mini App 로딩 상태를 관리하는 훅
 */
export function useMiniAppLoader(): MiniAppLoaderResult {
    const setProfile = useSetAtom(updateProfileAtom);
    const { isMiniAppReady, setMiniAppReady, context } = useMiniKit();
    const { address } = useWallet();
    const [initialLoadTimeout, setInitialLoadTimeout] = useState(false);

    // Base MiniKit context에서 user 정보 추출
    const userData = context?.user;

    // 초기 로딩 타임아웃 처리 (브라우저 환경에서 MiniKit이 초기화되지 않는 경우 대비)
    useEffect(() => {
        if (USE_MOCK_DATA) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setInitialLoadTimeout(true);
            // 타임아웃 후에도 MiniKit이 준비되지 않았으면 강제로 완료 처리
            if (!isMiniAppReady) {
                setMiniAppReady();
                sdk.actions.ready();
            }
        }, INITIAL_LOAD_TIMEOUT);

        return () => clearTimeout(timeoutId);
    }, [isMiniAppReady, setMiniAppReady]);

    const { data: user } = useUser();

    // 지갑 주소가 변경되면 백엔드에서 사용자 정보를 가져와 프로필 이미지를 업데이트합니다.
    useEffect(() => {
        if (user?.profileImage) {
            setProfile({ pfpUrl: user.profileImage });
        }
    }, [user, setProfile]);

    // 목업 모드 처리
    useEffect(() => {
        if (USE_MOCK_DATA) {
            setProfile({
                fid: MOCK_USER_PROFILE.fid || null,
                username: MOCK_USER_PROFILE.username || null,
                displayName: MOCK_USER_PROFILE.displayName || null,
                pfpUrl: MOCK_USER_PROFILE.pfpUrl || null,
            });
            if (!isMiniAppReady) {
                setMiniAppReady();
                sdk.actions.ready();
            }
        } else if (userData) {
            // Base MiniKit context에서 제공하는 사용자 데이터 사용
            // 초기 설정만 하고, 이후 백엔드 데이터가 있으면 위 useEffect에서 덮어씁니다.
            setProfile({
                fid: userData.fid || null,
                username: userData.username || null,
                displayName: userData.displayName || null,
                pfpUrl: userData.pfpUrl || null,
            });
            if (!isMiniAppReady) {
                setMiniAppReady();
                sdk.actions.ready();
            }
        } else if (initialLoadTimeout && !userData) {
            // 브라우저 환경에서 userData가 없어도 프로필을 빈 값으로 설정하고 로딩 완료
            setProfile({
                fid: null,
                username: null,
                displayName: null,
                pfpUrl: null,
            });
            if (!isMiniAppReady) {
                setMiniAppReady();
                sdk.actions.ready();
            }
        }
    }, [
        USE_MOCK_DATA,
        userData,
        isMiniAppReady,
        setMiniAppReady,
        setProfile,
        initialLoadTimeout,
    ]);

    // 미니앱 환경 여부 및 로딩 완료 상태 계산
    const result = useMemo(() => {
        if (USE_MOCK_DATA) {
            return {
                isInMiniApp: true,
                isFinishedLoading: true,
            };
        }

        // MiniApp이 준비되거나 타임아웃이 지나면 로딩 완료
        // - 실제 미니앱 환경: isMiniAppReady가 true이고 address가 있으면 완료
        // - 브라우저 환경: isMiniAppReady가 true이거나 타임아웃이 지나면 완료 (address 없어도 됨)
        const isFinished = isMiniAppReady || initialLoadTimeout;

        return {
            isInMiniApp: !!address, // Base Wallet 연결 = 미니앱 환경
            isFinishedLoading: isFinished,
        };
    }, [address, isMiniAppReady, initialLoadTimeout]);

    return result;
}
