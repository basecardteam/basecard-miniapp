/**
 * Retry utility for async operations
 * Automatically retries on failure, but immediately throws on user cancellation
 */

// User rejection error codes (MetaMask, WalletConnect, etc.)
const USER_REJECTION_CODES = [4001, "ACTION_REJECTED"];
const USER_REJECTION_MESSAGES = [
    "User rejected",
    "User denied",
    "user rejected",
    "user denied",
];

function isUserRejection(error: unknown): boolean {
    if (typeof error === "object" && error !== null) {
        const err = error as { code?: number | string; message?: string };

        // Check error code
        if (err.code && USER_REJECTION_CODES.includes(err.code)) {
            return true;
        }

        // Check error message
        if (err.message) {
            return USER_REJECTION_MESSAGES.some((msg) =>
                err.message!.toLowerCase().includes(msg.toLowerCase())
            );
        }
    }

    return false;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        delay?: number;
        onRetry?: (attempt: number, error: unknown) => void;
    } = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, onRetry } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // User rejection - don't retry
            if (isUserRejection(error)) {
                throw error;
            }

            // Last attempt - throw
            if (attempt === maxRetries) {
                throw error;
            }

            // Notify retry callback
            onRetry?.(attempt, error);

            // Wait before next attempt (exponential backoff)
            await new Promise((resolve) =>
                setTimeout(resolve, delay * attempt)
            );
        }
    }

    throw lastError;
}
