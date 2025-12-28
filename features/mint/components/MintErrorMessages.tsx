import { memo } from "react";

interface MintErrorMessagesProps {
    generationError?: string | null;
    mintError?: string | null;
}

interface ResolvedErrorInfo {
    title: string;
    description: string;
    help?: string;
    raw?: string;
}

const normalize = (error: string) => error.trim().toLowerCase();

const resolveGenerationError = (error: string): ResolvedErrorInfo => {
    const lower = normalize(error);

    if (
        lower.includes("timeout") ||
        lower.includes("fetch") ||
        lower.includes("network")
    ) {
        return {
            title: "We couldn’t reach the image service",
            description:
                "Please check your network connection and try again. If the issue persists, wait a moment and retry.",
            raw: error,
        };
    }

    if (
        lower.includes("file too large") ||
        lower.includes("size") ||
        lower.includes("5mb")
    ) {
        return {
            title: "Profile image is too large",
            description: "Upload a PNG or JPG smaller than 5 MB and try again.",
            raw: error,
        };
    }

    if (lower.includes("unsupported") || lower.includes("format")) {
        return {
            title: "Unsupported image format",
            description: "Please upload your profile image as PNG or JPG.",
            raw: error,
        };
    }

    return {
        title: "Something went wrong while creating your card",
        description:
            "Please try again in a moment. If this keeps happening, try a different image or contact support.",
        raw: error,
    };
};

const resolveMintError = (error: string): ResolvedErrorInfo => {
    const lower = normalize(error);
    console.log("resolveMintError", lower);

    if (
        lower.includes("user rejected") ||
        lower.includes("user denied") ||
        lower.includes("transaction was rejected") ||
        lower.includes("request rejected") ||
        lower.includes("rejected")
    ) {
        return {
            title: "Transaction approval was cancelled",
            description:
                "Open your wallet and approve the transaction to continue.",
            raw: error,
        };
    }

    if (
        lower.includes("insufficient funds") ||
        lower.includes("not enough funds")
    ) {
        return {
            title: "Not enough balance for gas",
            description: "Add funds for gas fees in your wallet and try again.",
            raw: error,
        };
    }

    if (
        lower.includes("chain mismatch") ||
        lower.includes("wrong chain") ||
        lower.includes("switch to")
    ) {
        return {
            title: "Wrong network selected",
            description:
                "Switch your wallet to the Base mainnet before retrying.",
            raw: error,
        };
    }

    if (lower.includes("execution reverted")) {
        const reasonMatch = error.match(
            /execution reverted(?: with reason string)?[:\s]*"?(.*)"?/i
        );
        const reason = reasonMatch && reasonMatch[1] ? reasonMatch[1] : null;

        return {
            title: "The smart contract rejected the request",
            description: reason
                ? `Reason: ${reason}. Double-check your inputs and try again.`
                : "Make sure your inputs meet the contract requirements and try again.",
            raw: error,
        };
    }

    if (
        lower.includes("nonce too low") ||
        lower.includes("replacement transaction underpriced")
    ) {
        return {
            title: "Another transaction is still pending",
            description:
                "Refresh your wallet or wait for pending transactions to settle, then try again.",
            raw: error,
        };
    }

    if (
        lower.includes("contract address not configured") ||
        lower.includes("invalid contract address")
    ) {
        return {
            title: "Service configuration issue",
            description:
                "Please try again later or reach out to the team. We’re already looking into it.",
            raw: error,
        };
    }

    return {
        title: "Something went wrong during the transaction",
        description:
            "Please try again shortly. If the error persists, contact support and share the details below.",
        raw: error,
    };
};

const renderErrorBox = ({
    title,
    description,
    help,
    raw,
}: ResolvedErrorInfo) => (
    <div
        className="w-full rounded-lg border border-red-200 bg-red-50 p-4"
        role="alert"
        aria-live="assertive"
    >
        <p className="text-sm font-semibold text-red-800">{title}</p>
        <p className="mt-1 text-sm text-red-700">{description}</p>
        {help && <p className="mt-2 text-xs text-red-600">{help}</p>}
        {/* {raw && (
            <details className="mt-2 text-xs text-red-500">
                <summary className="cursor-pointer select-none underline decoration-dotted">Show technical details</summary>
                <p className="mt-1 break-words">{raw}</p>
            </details>
        )} */}
    </div>
);

/**
 * 민팅 에러 메시지 컴포넌트
 */
export const MintErrorMessages = memo(function MintErrorMessages({
    generationError,
    mintError,
}: MintErrorMessagesProps) {
    if (!generationError && !mintError) {
        return null;
    }

    return (
        <>
            {generationError &&
                renderErrorBox(resolveGenerationError(generationError))}
            {mintError && renderErrorBox(resolveMintError(mintError))}
        </>
    );
});
