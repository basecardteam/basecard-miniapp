// src/components/miniapp/CardCollectionAdder.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ErrorModal from "@/components/modals/ErrorModal";
import LoadingModal from "@/components/modals/LoadingModal";
import SuccessModal from "@/components/modals/SuccessModal";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { addCollection } from "@/unused/collection";

interface CardCollectionAdderProps {
    collectedCardId: string;
}

export default function CardCollectionAdder({
    collectedCardId,
}: CardCollectionAdderProps) {
    const router = useRouter();
    const { data: myCard, isLoading: isCardLoading } = useMyBaseCard();

    const [isReadyToConfirm, setIsReadyToConfirm] = useState(false); // 확인 팝업 상태
    const [isProcessing, setIsProcessing] = useState(false); // API 처리 로딩 상태
    const [error, setError] = useState<string | null>(null);

    // -------------------------------------------------------------
    // 1. 수집 로직 (팝업에서 '확인' 시 실행)
    // -------------------------------------------------------------
    const handleCollect = useCallback(async () => {
        setIsReadyToConfirm(false); // 확인 버튼 눌렀으니 팝업 닫기

        // 이미 myCard?.id는 존재해야 여기까지 왔지만, 타입 가드를 위해 다시 확인
        if (!myCard?.id || myCard?.id === collectedCardId) {
            // 이 시점에서는 이미 에러 처리가 되었어야 하지만, 만약을 대비하여 로직을 중단
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            await addCollection({
                cardId: myCard.id,
                collectCardId: collectedCardId,
            });

            setIsProcessing(false);
            alert(`🎉 ${collectedCardId}번 카드를 성공적으로 수집했습니다!`);
            router.replace("/");
        } catch (err: any) {
            setIsProcessing(false);

            if (err.message.includes("Collection already exists")) {
                setError("이미 수집한 카드입니다.");
            } else {
                setError(err.message || "카드 수집에 실패했습니다.");
            }
        }
    }, [myCard?.id, collectedCardId, router]);

    // -------------------------------------------------------------
    // 2. 초기 로드 및 확인 로직 (useEffect)
    // -------------------------------------------------------------
    useEffect(() => {
        // TODO: 이 로직이 왜 필요한지, 어떻게 사용해야 할지 명확하지 않아 잠시 disable 함.
        // 추후 로직 확인 후 복구 필요.
        /* 
        // myCard 정보 로딩이 완료된 시점에만 실행
        if (isCardLoading) return;

        // A. 로그인 및 명함이 없을 경우 (에러/안내)
        if (!myCard?.id) {
            // 주소는 있지만 명함이 없을 경우 (민팅 유도)
            if (myCard?.user?.walletAddress) {
                setError("명함을 찾을 수 없습니다. 먼저 명함을 민팅해주세요.");
            } else {
                // 아예 로그인 정보가 없는 경우
                setError("카드를 수집하려면 로그인이 필요합니다.");
            }
            return; // 팝업 로직 중단
        }

        // B. 자기 자신의 카드인 경우 (에러)
        if (myCard.id === collectedCardId) {
            setError("자신의 카드는 수집할 수 없습니다.");
            return; // 팝업 로직 중단
        }

        // C. 모든 조건 만족 시, 확인 팝업 띄울 준비 완료
        setIsReadyToConfirm(true); 
        */
    }, [
        isCardLoading,
        myCard?.id,
        // myCard?.user?.walletAddress, // 주석 처리
        collectedCardId,
    ]);

    // -------------------------------------------------------------
    // 3. UX 관련 헬퍼 함수
    // -------------------------------------------------------------
    const handleCancel = useCallback(() => {
        // 취소 시에도 딥링크 파라미터를 제거하고 홈 화면으로 돌아가기
        setIsReadyToConfirm(false);
        router.replace("/");
    }, [router]);

    const handleCloseError = useCallback(() => {
        setError(null);
        router.replace("/");
    }, [router]);

    // -------------------------------------------------------------
    // 4. 모달 렌더링
    // -------------------------------------------------------------
    const isInitialLoading = isCardLoading;

    return (
        <>
            {/* A. 초기 로딩 모달 (myCard 정보 로딩 중) */}
            <LoadingModal
                isOpen={isInitialLoading || isProcessing}
                title={
                    isInitialLoading ? "프로필 확인 중..." : "카드 수집 중..."
                }
                description={
                    isInitialLoading
                        ? "로그인된 사용자 명함을 확인하고 있습니다."
                        : "컬렉션에 추가하고 있습니다."
                }
            />

            {/* B. 수집 확인 모달 */}
            <ConfirmationModal
                isOpen={isReadyToConfirm}
                onConfirm={handleCollect}
                onCancel={handleCancel}
                title="카드 수집 확인"
                description={`이 카드를 내 컬렉션에 추가하시겠습니까? (Card ID: ${collectedCardId})`}
                confirmText="수집하기"
            />

            {/* C. 에러 모달 */}
            <ErrorModal
                isOpen={!!error}
                onClose={handleCloseError}
                title="수집 오류"
                description={error || "알 수 없는 오류가 발생했습니다."}
            />
        </>
    );
}
