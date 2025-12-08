"use client";

import { memo } from "react";
import { IoAdd, IoCheckmarkCircle } from "react-icons/io5";

interface SkillTagProps {
    skill: string;
    isSelected: boolean;
    onClick: () => void;
}

/**
 * Skills 선택을 위한 태그 컴포넌트 - 모바일 최적화
 * 모든 태그에 + 아이콘 표시, 선택된 경우 체크마크로 변경
 */
export const SkillTag = memo(function SkillTag({ skill, isSelected, onClick }: SkillTagProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${isSelected
                ? "bg-gradient-to-r from-[#0050FF] to-[#4A90E2] text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
        >
            <span className="transition-all duration-200">{skill}</span>

            {/* 선택된 경우: 체크마크 */}
            {isSelected && (
                <IoCheckmarkCircle className="w-3 h-3 text-white flex-shrink-0" />
            )}

            {/* 선택 안 된 경우: + 아이콘 */}
            {!isSelected && (
                <IoAdd className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors duration-200" />
            )}
        </button>
    );
});
