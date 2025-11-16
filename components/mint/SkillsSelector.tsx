"use client";

import { ALL_SKILLS, MAX_SKILLS } from "@/lib/constants/mint";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoCheckmarkCircle, IoChevronDown, IoClose, IoSearch } from "react-icons/io5";

interface SkillsSelectorProps {
    selectedSkills: string[];
    onToggleSkill: (skill: string) => void;
}

/**
 * 스킬 선택 컴포넌트 - 드롭다운 + 검색
 */
export const SkillsSelector = memo(function SkillsSelector({ selectedSkills, onToggleSkill }: SkillsSelectorProps) {
    const selectedCount = selectedSkills.length;
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredSkills = useMemo(() => {
        if (!normalizedSearch) {
            return ALL_SKILLS;
        }

        return ALL_SKILLS.filter((skill) => skill.toLowerCase().includes(normalizedSearch));
    }, [normalizedSearch]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setSearchTerm("");
    }, []);

    const handleToggleDropdown = useCallback(() => {
        setIsOpen((prev) => {
            const next = !prev;
            if (!next) {
                setSearchTerm("");
            }
            return next;
        });
    }, []);

    const handleSelectSkill = useCallback(
        (skill: string) => {
            const isAlreadySelected = selectedSkills.includes(skill);
            const isSelectionBlocked = !isAlreadySelected && selectedCount >= MAX_SKILLS;
            if (isSelectionBlocked) {
                return;
            }

            onToggleSkill(skill);
        },
        [onToggleSkill, selectedCount, selectedSkills],
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) {
                return;
            }

            if (!containerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeDropdown, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeDropdown();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeDropdown, isOpen]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-lg font-semibold text-gray-900">
                    Skills <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-600 font-medium">
                    <span className="text-[#0050FF] font-bold">{selectedCount}</span> / {MAX_SKILLS}
                </span>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={handleToggleDropdown}
                    aria-expanded={isOpen}
                    className={`flex w-full items-center justify-between rounded-xl border-2 bg-white px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${selectedCount > 0
                        ? "border-[#0050FF]/60 bg-blue-50/70 text-[#0A2B6B]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                >
                    <div className="flex flex-wrap gap-2">
                        {selectedCount > 0 ? (
                            selectedSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="flex items-center gap-2 rounded-full bg-[#0050FF] px-3 py-1 text-xs font-semibold text-white shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">Select skills</span>
                        )}
                    </div>
                    <IoChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0050FF]" : "text-gray-400"}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                            <IoSearch className="h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search skills"
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                                aria-label="Search skills"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="text-gray-300 transition-colors hover:text-gray-500"
                                    aria-label="검색어 초기화"
                                >
                                    <IoClose className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto py-2">
                            {filteredSkills.length === 0 && (
                                <p className="px-4 py-6 text-center text-xs text-gray-400">No matching skills.</p>
                            )}
                            {filteredSkills.map((skill) => {
                                const isSelected = selectedSkills.includes(skill);
                                const isSelectionBlocked = !isSelected && selectedCount >= MAX_SKILLS;

                                return (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleSelectSkill(skill)}
                                        disabled={isSelectionBlocked}
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-sm transition-all ${isSelected
                                            ? "bg-blue-50 text-[#0A2B6B]"
                                            : isSelectionBlocked
                                                ? "cursor-not-allowed text-gray-300"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <IoCheckmarkCircle
                                                className={`h-4 w-4 ${isSelected ? "text-[#0050FF]" : "text-gray-300"}`}
                                            />
                                            {skill}
                                        </span>
                                        {isSelectionBlocked && !isSelected && (
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0050FF]">
                                                Max
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {selectedCount === 0 && (
                <p className="text-xs text-gray-500 italic">You can select up to {MAX_SKILLS} skills.</p>
            )}
            {selectedCount >= MAX_SKILLS && (
                <p className="flex items-center gap-1 text-xs font-medium text-[#0050FF]">
                    <span>✓</span> You selected the maximum of {MAX_SKILLS} skills.
                </p>
            )}
        </div>
    );
});
