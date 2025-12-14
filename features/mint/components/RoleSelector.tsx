"use client";

import type { Role } from "@/lib/constants/mint";
import { ROLES } from "@/lib/constants/mint";
import { memo } from "react";
import { FaBullhorn, FaCode, FaHandshake, FaPalette, FaRocket, FaTasks } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";

interface RoleSelectorProps {
    selectedRole: string;
    onRoleChange: (role: Role) => void;
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
    Developer: "Build amazing applications and smart contracts",
    Designer: "Create beautiful and user-friendly interfaces",
    Marketer: "Promote and grow communities and products",
    Founder: "Lead and build innovative projects from the ground up",
    BD: "Drive partnerships and expand business opportunities",
    PM: "Manage products and coordinate teams to deliver value",
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
    Developer: <FaCode className="w-4 h-4" />,
    Designer: <FaPalette className="w-4 h-4" />,
    Marketer: <FaBullhorn className="w-4 h-4" />,
    Founder: <FaRocket className="w-4 h-4" />,
    BD: <FaHandshake className="w-4 h-4" />,
    PM: <FaTasks className="w-4 h-4" />,
};

/**
 * 역할 선택 컴포넌트 - 모던한 카드 디자인
 */
export const RoleSelector = memo(function RoleSelector({
    selectedRole,
    onRoleChange,
}: RoleSelectorProps) {
    return (
        <div className="w-full space-y-3">
            <label
                htmlFor="role"
                className="text-lg font-semibold text-basecard-black"
            >
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
                            className={`group relative p-3 rounded-2xl bg-white border-2 transition-all duration-300 transform ${
                                isSelected
                                    ? "bg-gradient-to-br from-basecard-blue to-[#4A90E2] text-white border-transparent scale-[1.01]"
                                    : "text-basecard-black border-gray-200 hover:border-basecard-blue/50 hover:shadow-md  active:scale-[0.99]"
                            }`}
                        >
                            {/* 선택된 경우 배경 효과 */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            )}

                            <div className="flex items-start gap-2 relative z-10">
                                {/* 아이콘 */}
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-basecard-white text-basecard-gray group-hover:bg-basecard-blue/10 group-hover:text-basecard-blue"
                                    }`}
                                >
                                    {ROLE_ICONS[roleOption]}
                                </div>

                                {/* 텍스트 영역 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3
                                            className={`text-md font-semibold transition-colors ${
                                                isSelected
                                                    ? "text-white"
                                                    : "text-basecard-black"
                                            }`}
                                        >
                                            {roleOption}
                                        </h3>
                                        {isSelected && (
                                            <IoCheckmarkCircle className="w-6 h-6 text-white flex-shrink-0 animate-scale-in" />
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs transition-colors text-left ${
                                            isSelected
                                                ? "text-white/90"
                                                : "text-basecard-gray"
                                        }`}
                                    >
                                        {ROLE_DESCRIPTIONS[roleOption]}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
