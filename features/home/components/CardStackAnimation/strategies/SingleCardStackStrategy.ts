import {
    CardStackAnimationStrategy,
    LayerTransform,
} from "../types";
import { clamp01, easeOutSine, mapWithHold } from "../utils";
import { SCROLL_STEP_PX } from "../config";

/**
 * 단일 카드 스택 전략
 * 카드 하나만 위에 뜨는 구조 (현재 기본 스타일)
 */
export class SingleCardStackStrategy implements CardStackAnimationStrategy {
    readonly visibleCardCount = 1;
    readonly scrollStepPx = SCROLL_STEP_PX;

    // 애니메이션 상수
    private readonly STACK_SIZE = 4; // 동시에 보여줄 카드 수 (활성 + 다음 카드들)
    private readonly BASE_OFFSET_X = 0;
    private readonly BASE_OFFSET_Y = 16;
    private readonly BASE_OFFSET_Z = -120;
    private readonly SCALE_STEP = -0.06;
    private readonly HOLD = 0.35; // 활성 카드를 더 오래 보이게 유지하는 구간

    computeLayerTransform(
        layerIndex: number,
        depth: number,
        progress: number
    ): LayerTransform {
        const baseX = this.BASE_OFFSET_X * depth;
        const baseY = this.BASE_OFFSET_Y * depth;
        const baseZ = this.BASE_OFFSET_Z * depth;
        const baseScale = 1 + this.SCALE_STEP * depth;

        // defaults
        let tx = baseX;
        let ty = baseY;
        let tz = baseZ;
        let sc = baseScale;
        let op = 1;
        let blur = 0;

        if (layerIndex === 0) {
            // 맨 앞 카드 (활성 카드)
            const p = mapWithHold(progress, this.HOLD);
            ty = -80 * p;
            tz = 90 * p;
            sc = 1 + 0.03 * p;
            op = 1; // opacity 고정
            blur = 0;
        } else if (layerIndex === 1) {
            // 두 번째 카드 (다음에 올 카드)
            const p = easeOutSine(mapWithHold(progress, this.HOLD));
            tx = baseX * (1 - p);
            ty = baseY * (1 - p);
            tz = baseZ * (1 - p); // -120 -> 0
            sc = baseScale + (1 - baseScale) * p; // 작은 스케일 -> 1
            // 블러 중심 연출: 들어올수록 선명해짐 (강도 완화)
            op = 1;
            blur = Math.max(0, (1 - p) * 3);
        } else {
            // 뒤쪽 카드들
            const p = mapWithHold(progress, this.HOLD);
            const damp = Math.max(0, 1 - (layerIndex - 1) * 0.35);
            tx = baseX - baseX * 0.1 * p * damp;
            ty = baseY - baseY * 0.1 * p * damp;
            tz = baseZ - baseZ * 0.1 * p * damp;
            sc = baseScale + 0.01 * p * damp;
            op = 1;
            // 더 뒤쪽일수록 살짝 더 흐림 (강도 완화)
            blur = Math.min(5, 1 + (layerIndex - 1) * 1);
        }

        return { tx, ty, tz, sc, op, blur };
    }

    /**
     * 스택 크기 (렌더링할 최대 레이어 수)
     */
    get stackSize(): number {
        return this.STACK_SIZE;
    }
}
