interface MintHeaderProps {
    hasMinted: boolean;
}

/**
 * Mint 페이지의 헤더 컴포넌트
 */
export function MintHeader({ hasMinted }: MintHeaderProps) {
    return (
        <div className="flex flex-col pt-14 px-5">
            <h1 className="text-3xl font-semibold">Mint Your BaseCard</h1>
            <p className="text-lg font-medium text-gray-400">
                Everyone can be a builder
            </p>
            {hasMinted && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        ⚠️ You have already minted a BaseCard. Each address can only mint once.
                    </p>
                </div>
            )}
        </div>
    );
}

