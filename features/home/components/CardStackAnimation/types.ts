/**
 * 카드 스택 애니메이션 전략 인터페이스
 * Strategy 패턴을 사용하여 애니메이션 스타일을 쉽게 교체할 수 있도록 설계
 */

/**
 * 각 레이어의 transform 속성
 */
export interface LayerTransform {
    tx: number; // translateX
    ty: number; // translateY
    tz: number; // translateZ
    sc: number; // scale
    op: number; // opacity
    blur: number; // blur
}

/**
 * 카드 스택 애니메이션 전략 인터페이스
 * 각 애니메이션 스타일은 이 인터페이스를 구현해야 함
 */
export interface CardStackAnimationStrategy {
    /**
     * 표시할 최대 카드 수 (동시에 보이는 카드 수)
     */
    readonly visibleCardCount: number;

    /**
     * 각 레이어의 transform 계산
     * @param layerIndex 현재 레이어 인덱스 (0부터 시작, 0이 가장 앞)
     * @param depth 레이어 깊이
     * @param progress 스크롤 진행도 (0..1)
     * @returns 레이어의 transform 속성
     */
    computeLayerTransform(
        layerIndex: number,
        depth: number,
        progress: number
    ): LayerTransform;

    /**
     * 스크롤 스텝 크기 (픽셀 단위)
     * 한 카드가 교체되는 스크롤 거리
     */
    readonly scrollStepPx?: number;

    /**
     * 카드 간격 (픽셀 단위)
     * 동적으로 계산된 카드 간격
     */
    cardGap?: number;

    /**
     * 카드 간격 설정 (동적 업데이트용)
     */
    setCardGap?(gap: number): void;

    /**
     * 추가 설정 (선택적)
     * 전략별 커스텀 설정을 저장할 수 있음
     */
    readonly config?: Record<string, any>;
}
