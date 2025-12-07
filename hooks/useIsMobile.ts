// src/hooks/useIsMobile.ts (수정)
import { useEffect, useState } from 'react';

interface MobileOS {
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
}

export const useIsMobile = (): MobileOS => {
    const [os, setOs] = useState<MobileOS>({
        isMobile: false,
        isIOS: false,
        isAndroid: false,
    });

    useEffect(() => {
        const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
        // 1. OS 구분
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);

        // 2. 일반 모바일 여부 (다른 모바일 기기 포함)
        const isGeneralMobile = isIOS || isAndroid ||
            Boolean(userAgent.match(/BlackBerry|Opera Mini|IEMobile|WPDesktop/i));

        setOs({
            isMobile: isGeneralMobile,
            isIOS: isIOS,
            isAndroid: isAndroid,
        });

    }, []);

    return os;
};