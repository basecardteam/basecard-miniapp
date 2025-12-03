"use client";

import { cn } from "@/lib/legacy/utils"; // Tailwind 클래스 병합 유틸리티 (cn)
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa6"; // FaAngleLeft 아이콘 사용

interface BackButtonProps {
    className?: string;
    size?: number;
}

export default function BackButton({ className, size = 40 }: BackButtonProps) {
    const router = useRouter();

    // 기본 스타일
    const baseClasses =
        "absolute left-2 top-2 p-2 rounded-full cursor-pointer transition-colors duration-200 ";

    return (
        <FaAngleLeft
            size={size}
            onClick={() => router.back()} // 💡 router.back() 호출
            className={cn(baseClasses, className)} // 💡 기본 스타일과 추가 스타일 병합
        />
    );
}
