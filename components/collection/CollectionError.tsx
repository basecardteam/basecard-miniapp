interface CollectionErrorProps {
    error: unknown;
    onRetry: () => void;
}

export function CollectionError({ error, onRetry }: CollectionErrorProps) {
    return (
        <div className="text-center py-8">
            <p className="text-red-500 font-k2d-regular">
                Error: {JSON.stringify(error)}
            </p>
            <button
                onClick={onRetry}
                className="mt-2 px-4 py-2 bg-[#0050FF] text-white rounded-lg font-k2d-medium hover:bg-[#0040CC] transition-colors"
            >
                Retry
            </button>
        </div>
    );
}

