interface CollectionPayload {
    cardId: string; // 수집하는 사람 (로그인된 유저)의 카드 ID
    collectCardId: string; // 수집되는 사람 (QR 코드의 주인)의 카드 ID
}

/**
 * 두 카드 사이에 새로운 컬렉션 관계를 생성합니다.
 * @param payload - cardId(수집자)와 collectCardId(수집되는 카드)를 포함하는 객체
 * @returns 성공적으로 생성된 컬렉션 객체
 */
export async function addCollection(payload: CollectionPayload): Promise<any> {
    const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        // API에서 정의한 400, 404, 409 등의 에러 메시지를 던집니다.
        throw new Error(data.message || "Failed to add collection.");
    }

    return data;
}

export type CollectionFilterTag = "All" | "Designer" | "Dev" | "MKT";
