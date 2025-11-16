"use client";

import type { Role } from "@/lib/constants/mint";
import { ROLES } from "@/lib/constants/mint";
import { memo } from "react";
import { FaBullhorn, FaCode, FaPalette } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";

interface RoleSelectorProps {
    selectedRole: string;
    onRoleChange: (role: Role) => void;
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
    Developer: "Build amazing applications and smart contracts",
    Designer: "Create beautiful and user-friendly interfaces",
    Marketer: "Promote and grow communities and products",
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
    Developer: <FaCode className="w-5 h-5" />,
    Designer: <FaPalette className="w-5 h-5" />,
    Marketer: <FaBullhorn className="w-5 h-5" />,
};

/**
 * 역할 선택 컴포넌트 - 모던한 카드 디자인
 */
export const RoleSelector = memo(function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
    return (
        <div className="w-full space-y-3">
            <label htmlFor="role" className="text-lg font-semibold text-gray-900">
                Your Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
                {ROLES.map((roleOption) => {
                    const isSelected = selectedRole === roleOption;
                    return (
                        <button
                            key={roleOption}
                            type="button"
                            onClick={() => onRoleChange(roleOption)}
                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${isSelected
                                ? "bg-gradient-to-br from-[#0050FF] to-[#4A90E2] text-white border-transparent shadow-lg shadow-blue-500/30 transform scale-[1.02]"
                                : "bg-white text-gray-900 border-gray-200 hover:border-[#0050FF]/50 hover:shadow-md hover:bg-gray-50 active:scale-[0.98]"
                                }`}
                        >
                            {/* 선택된 경우 배경 효과 */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            )}

                            <div className="flex items-start gap-4 relative z-10">
                                {/* 아이콘 */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600 group-hover:bg-[#0050FF]/10 group-hover:text-[#0050FF]"
                                        }`}
                                >
                                    {ROLE_ICONS[roleOption]}
                                </div>

                                {/* 텍스트 영역 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={`text-lg font-bold transition-colors ${isSelected ? "text-white" : "text-gray-900"}`}>
                                            {roleOption}
                                        </h3>
                                        {isSelected && (
                                            <IoCheckmarkCircle className="w-6 h-6 text-white flex-shrink-0 animate-scale-in" />
                                        )}
                                    </div>
                                    <p
                                        className={`text-sm leading-relaxed transition-colors ${isSelected ? "text-white/90" : "text-gray-600"
                                            }`}
                                    >
                                        {ROLE_DESCRIPTIONS[roleOption]}
                                    </p>
                                </div>
                            </div>

                            {/* 호버 효과 */}
                            {!isSelected && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0050FF]/5 to-transparent pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
