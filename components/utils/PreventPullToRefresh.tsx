"use client";

import { useEffect } from "react";

export default function PreventPullToRefresh() {
    useEffect(() => {
        // Find the nearest scrollable parent
        const getScrollParent = (
            node: HTMLElement | null
        ): HTMLElement | null => {
            if (!node || node === document.body) {
                return null;
            }

            const overflowY = window.getComputedStyle(node).overflowY;
            const isScrollable =
                (overflowY === "auto" || overflowY === "scroll") &&
                node.scrollHeight > node.clientHeight;

            // Explicitly check for our class or general scrollability
            if (isScrollable || node.classList.contains("scroll-container")) {
                return node;
            }

            return getScrollParent(node.parentElement);
        };

        const onTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            const scrollableParent = getScrollParent(target);

            if (!scrollableParent) return;

            const { scrollTop, scrollHeight, clientHeight } = scrollableParent;

            // 1px Buffer Hack:
            // If at top, bump down 1px to prevent parent scroll chaining (PTR)
            if (scrollTop === 0) {
                scrollableParent.scrollTop = 1;
            }
            // If at bottom, bump up 1px to prevent parent scroll chaining
            else if (scrollTop + clientHeight >= scrollHeight) {
                scrollableParent.scrollTop = scrollHeight - clientHeight - 1;
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            const scrollableParent = getScrollParent(target);

            // If no scrollable parent, prevent default (stops body scroll)
            if (!scrollableParent) {
                // Allow specific exceptions like range inputs
                if (
                    target.tagName === "INPUT" &&
                    target.getAttribute("type") === "range"
                )
                    return;

                if (e.cancelable) e.preventDefault();
            }
        };

        document.addEventListener("touchstart", onTouchStart, {
            passive: false,
        });
        // We need touchmove listener on document to block body scrolling for non-scrollable areas
        document.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

    return null;
}
