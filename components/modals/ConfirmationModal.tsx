// src/components/common/ConfirmationModal.tsx

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    // collectedCardId?: number; // 필요하다면 props로 받아서 description에 활용
}

export default function ConfirmationModal({
    isOpen,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-80 bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center"
                style={{
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                }}
            >
                {/* Title and Description */}
                <div className="text-center mb-6 w-full">
                    <h2 className="text-2xl font-k2d font-bold text-gray-800 mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed px-1">
                        {description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full space-x-3">
                    {/* 취소 버튼 */}
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-lg bg-[#0050FF] text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}