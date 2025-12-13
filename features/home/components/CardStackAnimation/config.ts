/**
 * 카드 스택 애니메이션 공통 설정
 */

/**
 * 한 카드가 교체되는 스크롤 거리 (픽셀)
 */
export const SCROLL_STEP_PX = 260;

/**
 * 카드 크기 설정
 * CardItem은 aspectRatio 5/3, width 100%에 px-5 (좌우 20px씩) 패딩 적용
 */
export const CARD_ASPECT_RATIO = 5 / 3;
export const CARD_HORIZONTAL_PADDING = 40; // px-5 * 2 = 40px
export const CARD_GAP_EXTRA = 8; // 카드 간 추가 여백
export const MAX_CARD_WIDTH = 400; // 최대 카드 너비 (px)

/**
 * 카드 높이 계산 함수
 * @param containerWidth 컨테이너 너비 (px)
 * @returns 카드 높이 (px)
 */
export function calculateCardHeight(containerWidth: number): number {
    // 최대 카드 너비 제한 적용
    const effectiveWidth = Math.min(containerWidth, MAX_CARD_WIDTH + CARD_HORIZONTAL_PADDING);
    const cardWidth = effectiveWidth - CARD_HORIZONTAL_PADDING;
    return cardWidth / CARD_ASPECT_RATIO;
}

/**
 * 카드 간격 계산 함수 (겹치지 않도록)
 * @param containerWidth 컨테이너 너비 (px)
 * @returns 카드 간 세로 간격 (px)
 */
export function calculateCardGap(containerWidth: number): number {
    return calculateCardHeight(containerWidth) + CARD_GAP_EXTRA;
}

/**
 * 스크롤 스냅 관련 설정
 */
export const START_OFFSET_PX = 140; // 섹션 시작보다 이만큼 먼저 고정 시작
export const END_OFFSET_PX = 0; // 필요 시 끝 지점도 보정
export const SNAP_DELAY_MS = 100; // 스크롤 멈춤 감지 대기 시간
export const SNAP_SCROLL_MS = 200; // 프로그램적 스크롤 예상 시간
