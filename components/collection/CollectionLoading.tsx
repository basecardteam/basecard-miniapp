/**
 * Collection 페이지의 로딩 스켈레톤 컴포넌트
 * 실제 카드 리스트 레이아웃과 유사한 스켈레톤 UI를 제공합니다.
 */
export function CollectionLoading() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="group shadow-xl rounded-2xl flex w-full mx-auto overflow-hidden"
                >
                    <div
                        className="relative bg-gray-200 rounded-2xl w-full animate-pulse"
                        style={{ aspectRatio: "5/3" }}
                    >
                        {/* 카드 이미지 스켈레톤 */}
                        <div className="w-full h-full bg-gray-200 rounded-2xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

