/**
 * 카드 스택 애니메이션 유틸리티 함수들
 * 순수 함수들로 React 의존성 없음
 */

/**
 * 값을 0과 1 사이로 클램프
 */
export function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

/**
 * Ease-out sine 이징 함수
 * @param t 진행도 (0..1)
 * @returns 이징된 값 (0..1)
 */
export function easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
}

/**
 * iOS 스타일 cubic-bezier 이징 함수
 * cubic-bezier(0.25, 0.8, 0.25, 1) - iOS 푸시 알림 스프링 효과
 * @param t 진행도 (0..1)
 * @returns 이징된 값 (0..1)
 */
export function easeOutiOS(t: number): number {
    // cubic-bezier(0.25, 0.8, 0.25, 1) 근사치
    // 빠르게 시작하고 부드럽게 감속하는 스프링 느낌
    const p1y = 0.8;
    const p2y = 1;
    const ct = 1 - t;
    // Bezier curve: (1-t)^3*0 + 3*(1-t)^2*t*p1y + 3*(1-t)*t^2*p2y + t^3*1
    return 3 * ct * ct * t * p1y + 3 * ct * t * t * p2y + t * t * t;
}

/**
 * iOS 스타일 ease-in 이징 함수
 * 슬라이드 아웃 시 사용
 * @param t 진행도 (0..1)
 * @returns 이징된 값 (0..1)
 */
export function easeIniOS(t: number): number {
    // 부드럽게 시작하고 빠르게 끝나는 효과
    return t * t * t;
}

/**
 * Hold 구간을 고려한 매핑
 * @param t 진행도 (0..1)
 * @param hold hold 구간 (0..1)
 * @returns 매핑된 진행도 (0..1)
 */
export function mapWithHold(t: number, hold: number): number {
    return clamp01((t - hold) / (1 - hold));
}
