"use client";

import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

// Jotai atom for toast state
const toastsAtom = atom<Toast[]>([]);

const TOAST_DURATION = 3000;

// Hook to show toast
export function useToast() {
    const setToasts = useSetAtom(toastsAtom);

    const showToast = useCallback(
        (message: string, type: ToastType = "info") => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const newToast: Toast = { id, message, type };

            // 기존 토스트 모두 제거하고 새 토스트만 표시
            setToasts([newToast]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, TOAST_DURATION);
        },
        [setToasts]
    );

    return { showToast };
}

// Styles
const toastStyles: Record<ToastType, string> = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-basecard-blue text-white",
    warning: "bg-yellow-500 text-white",
};

const toastIcons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
};

// Toast UI Component (place this once in your app)
export function ToastContainer() {
    const [toasts, setToasts] = useAtom(toastsAtom);

    const removeToast = useCallback(
        (id: string) => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        },
        [setToasts]
    );

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        ${toastStyles[toast.type]}
                        px-4 py-3 rounded-xl shadow-lg
                        flex items-center gap-2
                        animate-toast-slide-in
                        pointer-events-auto
                        w-full
                    `}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className="text-lg font-bold flex-shrink-0">
                        {toastIcons[toast.type]}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {toast.message}
                    </span>
                </div>
            ))}
        </div>
    );
}
