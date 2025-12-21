import {
    CardStackAnimationStrategy,
    LayerTransform,
} from "../types";
import { clamp01, easeOutiOS, easeIniOS } from "../utils";
import { SCROLL_STEP_PX } from "../config";

/**
 * iOS 푸시 알림 스타일 애니메이션 전략
 * 카드가 위에서 아래로 슬라이드하며 나타나는 효과
 * cubic ease-in으로 부드럽게 등장
 */
export class IOSNotificationStrategy implements CardStackAnimationStrategy {
    readonly visibleCardCount = 1;
    readonly scrollStepPx = SCROLL_STEP_PX;

    // 애니메이션 상수
    private readonly SLIDE_IN_DISTANCE = -400; // 카드가 위에서 들어오는 거리
    private readonly SLIDE_OUT_DISTANCE = -200; // 카드가 위로 나가는 거리
    private readonly STACK_OFFSET_Y = 12; // 뒤 카드들의 Y 오프셋
    private readonly SCALE_DECAY = 0.04; // 뒤 카드들의 스케일 감소량

    computeLayerTransform(
        layerIndex: number,
        depth: number,
        progress: number
    ): LayerTransform {
        // 기본값
        let tx = 0;
        let ty = 0;
        let tz = 0;
        let sc = 1;
        let op = 1;
        let blur = 0;

        if (layerIndex < 0) {
            // 이전 카드 (위로 슬라이드 아웃)
            const slideProgress = clamp01(1 + layerIndex + progress);
            const eased = easeIniOS(slideProgress);

            ty = this.SLIDE_OUT_DISTANCE * eased;
            sc = 1 - 0.1 * eased;
            op = 1 - eased;
            blur = 0;
        } else if (layerIndex === 0) {
            // 현재 활성 카드
            // 스크롤하면 위로 슬라이드 아웃 시작
            const eased = easeIniOS(progress);

            ty = this.SLIDE_OUT_DISTANCE * eased * 0.5;
            sc = 1 - 0.05 * eased;
            op = 1 - progress * 0.3;
            blur = 0;
        } else if (layerIndex === 1) {
            // 다음 카드 (위에서 슬라이드 인)
            // iOS 푸시 알림처럼 cubic ease로 부드럽게 등장
            const eased = easeOutiOS(progress);

            // 위에서 아래로 슬라이드
            ty = this.SLIDE_IN_DISTANCE * (1 - eased);
            tz = -50 * (1 - eased);
            sc = 0.9 + 0.1 * eased;
            op = 0.3 + 0.7 * eased;
            blur = 8 * (1 - eased);
        } else {
            // 대기 중인 카드들 (스택에서 대기)
            const stackPosition = layerIndex - 1;
            const p = easeOutiOS(progress);

            // 뒤로 갈수록 위로 살짝 쌓임
            ty = this.SLIDE_IN_DISTANCE + (this.STACK_OFFSET_Y * stackPosition) - (this.STACK_OFFSET_Y * p);
            tz = -100 - 30 * stackPosition;
            sc = Math.max(0.8, 1 - this.SCALE_DECAY * stackPosition - 0.02 * (1 - p));
            op = Math.max(0, 1 - stackPosition * 0.3);
            blur = 4 + stackPosition * 2;
        }

        return { tx, ty, tz, sc, op, blur };
    }

    /**
     * 스택 크기 (렌더링할 최대 레이어 수)
     */
    get stackSize(): number {
        return 4;
    }
}
