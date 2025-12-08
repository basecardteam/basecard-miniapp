import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/**
 * 미니앱으로 직접 전달된 URL (예: https://yourminiapp.com?action=addCardCollection&id=5)에서
 * 필요한 쿼리 파라미터를 추출하는 Hook.
 * @returns {action: string | null, cardId: number | null} - 추출된 파라미터 객체
 */
export const useMiniappParams = (): {
    action: string | null;
    cardId: string | null;
} => {
    const searchParams = useSearchParams();
    // URL 파라미터가 변경될 때만 파싱 로직을 다시 실행하도록 useMemo 사용
    const parsedParams = useMemo(() => {
        const result: { action: string | null; cardId: string | null } = {
            action: null,
            cardId: null,
        };

        try {
            // 현재 URL에서 쿼리 파라미터를 추출합니다.
            const action = searchParams.get("action");

            if (action) {
                result.action = action;
            }

            // 'id' 파라미터 추출 (Card ID로 간주)
            const idString = searchParams.get("id");
            if (idString) {
                result.cardId = idString;
            }
        } catch (e) {
            console.error("URL parameter parsing failed:", e);
        }

        return result;
    }, [searchParams]);

    return parsedParams;
};
