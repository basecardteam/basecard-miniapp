import { CollectionFilterTag } from "./collection";
import { COLLECTION_TAGS, TAG_ROLE_MAP } from "../lib/constants/collections";
import { Card } from "../lib/types";

export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * 목업 데이터 사용 여부 확인
 * NEXT_PUBLIC_USE_MOCK_DATA 환경 변수가 "true"일 때 활성화
 */
export const isMockMode = () => {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
};

// 🚨 Next.js API Route로 데이터를 전송하는 함수입니다.
interface LogPayload {
    message: string;
    data?: unknown;
    path?: string; // 어떤 경로에서 로그를 보냈는지 기록
}

/**
 * 클라이언트 로그를 Next.js API Route로 전송하여 서버 콘솔에 기록합니다.
 */
export async function remoteLog(payload: LogPayload) {
    // 로컬 개발 시에는 console.log도 함께 실행합니다.
    if (process.env.NODE_ENV === "development") {
        console.log("REMOTE LOG (Local Only):", payload);
    }

    try {
        await fetch("/api/debug", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
            }),
            // 🚨 백그라운드에서 실행되도록 fetch 옵션을 설정합니다.
            cache: "no-store",
        });
    } catch (error) {
        // API 호출 자체에 실패했을 경우 (네트워크 오류 등)
        console.error("Failed to send remote log:", error);
    }
}

export function filterCollections(
    cards: Card[] | undefined,
    selectedTag: CollectionFilterTag,
    searchTerm = ""
) {
    if (!cards) {
        return { filteredCards: [], tags: COLLECTION_TAGS };
    }

    const role = TAG_ROLE_MAP[selectedTag];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredCards = cards.filter((card) => {
        const matchesRole = !role || card.role === role;
        if (!matchesRole) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const searchableValues: (string | undefined | null)[] = [
            card.nickname,
            // card.basename, // Removed
            card.role,
            card.user?.walletAddress, // Updated
        ];

        // if (Array.isArray(card.skills)) {
        //     searchableValues.push(card.skills.join(" "));
        // }

        const haystack = searchableValues
            .filter(
                (value): value is string => !!value && value.trim().length > 0
            )
            .join(" ")
            .toLowerCase();

        return haystack.includes(normalizedSearch);
    });

    return {
        filteredCards,
        tags: COLLECTION_TAGS,
    };
}
