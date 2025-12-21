import {
    CardStackAnimationStrategy,
    LayerTransform,
} from "../types";
import { easeOutiOS, mapWithHold } from "../utils";
import { SCROLL_STEP_PX, calculateCardGap } from "../config";

/**
 * 애플 알림 리스트 스타일 애니메이션
 * - 화면은 고정, 카드가 아래에서 위로 올라옴
 * - 맨 위 카드는 뒤로 밀리면서 페이드아웃 + 블러 처리
 * - 최대 2~3개 카드가 화면에 보임
 */
export class MultiCardStackStrategy implements CardStackAnimationStrategy {
    readonly visibleCardCount = 3;
    readonly scrollStepPx = SCROLL_STEP_PX;

    // 애니메이션 상수
    private readonly STACK_SIZE = 4; // 앞으로 렌더링할 카드 수
    private readonly PREV_CARD_COUNT = 2; // 뒤로 렌더링할 카드 수 (사라지는 카드)
    private readonly HOLD = 0; // 초반 홀드 구간
    private readonly DEFAULT_CARD_GAP = 240; // 기본 카드 간격 (fallback)

    // 동적 카드 간격 (컨테이너 너비 기반으로 계산됨)
    cardGap: number = this.DEFAULT_CARD_GAP;

    /**
     * 카드 간격 설정 (컨테이너 너비 기반으로 동적 계산)
     */
    setCardGap(gap: number): void {
        this.cardGap = gap;
    }

    /**
     * 컨테이너 너비로 카드 간격 업데이트
     */
    updateCardGapFromWidth(containerWidth: number): void {
        if (containerWidth > 0) {
            this.cardGap = calculateCardGap(containerWidth);
        }
    }

    computeLayerTransform(
        layerIndex: number,
        _depth: number,
        progress: number
    ): LayerTransform {
        // iOS 스타일 cubic-bezier 이징 적용
        const p = easeOutiOS(mapWithHold(progress, this.HOLD));
        const gap = this.cardGap;

        let ty = 0;
        let tz = 0;
        let sc = 1;
        let op = 1;
        let blur = 0;

        if (layerIndex < 0) {
            // 이전 카드들: 숨김
            op = 0;
        } else if (layerIndex < this.visibleCardCount) {
            // 화면에 이미 보이는 카드들 (0, 1, 2): 애니메이션 없이 위치만 이동
            ty = layerIndex * gap - p * gap;
            op = 1;
            sc = 1;
        } else {
            // 새로 들어오는 카드 (3+): iOS 푸시 알림 스타일 애니메이션
            const startY = gap * layerIndex;
            ty = startY - p * gap;
            // 아래에서 올라오면서 페이드 인
            op = p;
        }

        return { tx: 0, ty, tz, sc, op, blur };
    }

    get stackSize(): number {
        return this.STACK_SIZE;
    }

    get prevCardCount(): number {
        return this.PREV_CARD_COUNT;
    }
}
