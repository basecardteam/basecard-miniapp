// components/providers/MiniAppBootstrapper.tsx
"use client";

import { useMiniAppLoader } from "@/hooks/useMiniAppLoader";

export function MiniAppBootstrapper() {
    useMiniAppLoader(); // 반환값을 쓰지 않아도 실행만으로 전역 상태 세팅
    return null;
}