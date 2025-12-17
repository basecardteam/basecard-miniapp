"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_WEBSITES } from "@/lib/constants/mint";
import { memo, useState } from "react";
import { FaLink, FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface WebsitesInputProps {
    websites: string[];
    newWebsite: string;
    onNewWebsiteChange: (value: string) => void;
    onAddWebsite: () => void;
    onRemoveWebsite: (url: string) => void;
    urlError?: string | null;
}

/**
 * 웹사이트 입력 컴포넌트 - 모던한 태그 디자인
 */
export const WebsitesInput = memo(function WebsitesInput({
    websites,
    newWebsite,
    onNewWebsiteChange,
    onAddWebsite,
    onRemoveWebsite,
    urlError,
}: WebsitesInputProps) {
    const isMaxReached = websites.length >= MAX_WEBSITES;
    const [localError, setLocalError] = useState<string | null>(urlError ?? null);
    const [isValid, setIsValid] = useState(false);

    // URL 유효성 검사 함수
    const validateUrl = (url: string): boolean => {
        if (!url.trim()) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
            return false;
        }
    };

    // 입력 시 실시간 검증
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onNewWebsiteChange(value);

        if (!value.trim()) {
            setLocalError(null);
            setIsValid(false);
            return;
        }

        // 중복 체크
        if (websites.includes(value.trim())) {
            setLocalError("This URL is already added");
            setIsValid(false);
            return;
        }

        // URL 형식 검증
        if (validateUrl(value)) {
            setLocalError(null);
            setIsValid(true);
        } else {
            setLocalError("Please enter a valid URL (https://...)");
            setIsValid(false);
        }
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-gray-900">
                    Websites
                </Label>
                {websites.length > 0 && (
                    <span className="text-sm text-gray-600 font-medium">
                        <span className="text-[#0050FF] font-bold">{websites.length}</span> / {MAX_WEBSITES}
                    </span>
                )}
            </div>

            {/* 웹사이트 추가 입력 필드 */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <FaLink className="w-4 h-4" />
                    </div>
                    <Input
                        id="new-website"
                        type="url"
                        value={newWebsite}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                if (!isMaxReached && isValid) {
                                    onAddWebsite();
                                }
                            }
                        }}
                        className={`pl-10 h-10 text-base rounded-xl border-2 transition-all duration-300  placeholder:text-sm
                            ${localError ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
            : isMaxReached
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-200 focus:border-[#0050FF] focus:ring-[#0050FF]/20 hover:border-gray-300"
        }`}
                        placeholder="https://your-site.com"
                        disabled={isMaxReached}
                    />
                </div>
                <button
                    type="button"
                    onClick={onAddWebsite}
                    disabled={!isValid || isMaxReached}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all
            ${!isValid || isMaxReached ? "bg-gray-300" : "bg-[#0050FF] active:scale-95"}`}
                >
                    <FaPlus size={14} />
                </button>
            </div>

            {/* URL 에러 메시지 - 작은 경고 문구 */}
            {localError && (
                <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                    <span>⚠</span> {localError}
                </p>
            )}

            {/* 현재 웹사이트 목록 */}
            <div className="space-y-1">
                {websites.map((url) => (
                    <div key={url} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3 min-w-0">
                            <FaLink className="w-4 h-4 text-[#0050FF] flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{url}</span>
                        </div>
                        <IoClose onClick={() => onRemoveWebsite(url)} className="w-5 h-5 text-gray-400" />
                    </div>
                ))}
            </div>

            {/* 안내 텍스트 */}
            {websites.length === 0 && !localError && (
                <p className="text-xs text-gray-500 italic">Add up to {MAX_WEBSITES} websites</p>
            )}
            {isMaxReached && (
                <p className="text-xs text-[#0050FF] font-medium flex items-center gap-1">
                    <span>✓</span> Maximum {MAX_WEBSITES} websites added
                </p>
            )}
        </div>
    );
});
