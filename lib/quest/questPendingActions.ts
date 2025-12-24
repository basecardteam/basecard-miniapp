/**
 * Quest Pending Actions - Local Storage Utility
 *
 * Manages pending quest actions in localStorage.
 * When a user clicks an external link (e.g., Follow on Farcaster),
 * we store the actionType so we can trigger verification when they return.
 */

const STORAGE_KEY = "basecard_quest_pending_actions";

interface PendingAction {
    actionType: string;
    timestamp: number;
}

/**
 * Get all pending actions from localStorage
 */
export function getPendingActions(): PendingAction[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as PendingAction[];
    } catch {
        return [];
    }
}

/**
 * Set a pending action when user clicks external link
 */
export function setPendingAction(actionType: string): void {
    if (typeof window === "undefined") return;

    try {
        const existing = getPendingActions();

        // Avoid duplicates - update timestamp if already exists
        const filtered = existing.filter((a) => a.actionType !== actionType);
        filtered.push({
            actionType,
            timestamp: Date.now(),
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
        // Silently fail on storage errors
    }
}

/**
 * Clear a specific pending action (after verification)
 */
export function clearPendingAction(actionType: string): void {
    if (typeof window === "undefined") return;

    try {
        const existing = getPendingActions();
        const filtered = existing.filter((a) => a.actionType !== actionType);

        if (filtered.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
    } catch {
        // Silently fail
    }
}

/**
 * Clear all pending actions
 */
export function clearAllPendingActions(): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Silently fail
    }
}

/**
 * Get pending action types only (string array)
 */
export function getPendingActionTypes(): string[] {
    return getPendingActions().map((a) => a.actionType);
}

/**
 * Check if a specific action is pending
 */
export function hasPendingAction(actionType: string): boolean {
    return getPendingActions().some((a) => a.actionType === actionType);
}
