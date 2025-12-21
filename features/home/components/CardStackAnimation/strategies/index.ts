import { CardStackAnimationStrategy } from "../types";
import { SingleCardStackStrategy } from "./SingleCardStackStrategy";
import { MultiCardStackStrategy } from "./MultiCardStackStrategy";
import { IOSNotificationStrategy } from "./IOSNotificationStrategy";

/**
 * 전략 타입 이름
 */
export type StrategyName = "single" | "multi" | "ios";

/**
 * 전략 팩토리 함수
 * @param name 전략 이름
 * @returns 해당 전략 인스턴스
 */
export function createStrategy(
    name: StrategyName = "single"
): CardStackAnimationStrategy {
    switch (name) {
        case "single":
            return new SingleCardStackStrategy();
        case "multi":
            return new MultiCardStackStrategy();
        case "ios":
            return new IOSNotificationStrategy();
        default:
            return new SingleCardStackStrategy();
    }
}

/**
 * 기본 전략 (SingleCardStackStrategy)
 */
export function getDefaultStrategy(): CardStackAnimationStrategy {
    return new SingleCardStackStrategy();
}

// Export strategies
export { SingleCardStackStrategy, MultiCardStackStrategy, IOSNotificationStrategy };
