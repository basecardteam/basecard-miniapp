/**
 * CardStackAnimation 모듈 export
 */

// Types
export type { CardStackAnimationStrategy, LayerTransform } from "./types";

// Utils
export { clamp01, easeOutSine, mapWithHold } from "./utils";

// Config
export {
    SCROLL_STEP_PX,
    START_OFFSET_PX,
    END_OFFSET_PX,
    SNAP_DELAY_MS,
    SNAP_SCROLL_MS,
    CARD_ASPECT_RATIO,
    CARD_HORIZONTAL_PADDING,
    CARD_GAP_EXTRA,
    MAX_CARD_WIDTH,
    calculateCardHeight,
    calculateCardGap,
} from "./config";

// Hooks
export {
    useCardStackScroll,
    type UseCardStackScrollProps,
    type UseCardStackScrollReturn,
} from "./useCardStackScroll";

// Components
export { default as CardStack } from "./CardStack";

// Strategies
export {
    SingleCardStackStrategy,
    MultiCardStackStrategy,
    createStrategy,
    getDefaultStrategy,
    type StrategyName,
} from "./strategies";
