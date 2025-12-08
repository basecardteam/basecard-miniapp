"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_WEBSITES } from "@/lib/constants/mint";
import { memo, useEffect, useState } from "react";
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
    const [localError, setLocalError] = useState<string | null>(null);

    // URL 에러 상태 관리 - 입력하면 사라지도록
    useEffect(() => {
        if (urlError) {
            setLocalError(urlError);
        }
    }, [urlError]);

    // 입력 시 에러 메시지 사라지도록
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onNewWebsiteChange(value);
        if (localError && value.trim()) {
            setLocalError(null);
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
                                if (!isMaxReached && newWebsite.trim() && !localError) {
                                    onAddWebsite();
                                }
                            }
                        }}
                        className={`pl-12 pr-4 h-12 text-base rounded-xl border-2 transition-all duration-300 ${localError
                            ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
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
                    disabled={!newWebsite.trim() || isMaxReached || !!localError}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-medium text-white transition-all duration-300 flex-shrink-0 ${!newWebsite.trim() || isMaxReached || !!localError
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#0050FF] to-[#4A90E2] hover:from-[#0066FF] hover:to-[#5AA0F2] shadow-md hover:shadow-lg active:scale-95"
                        }`}
                >
                    <FaPlus size={16} />
                </button>
            </div>

            {/* URL 에러 메시지 - 작은 경고 문구 */}
            {localError && (
                <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                    <span>⚠</span> {localError}
                </p>
            )}

            {/* 현재 웹사이트 목록 */}
            {websites.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {websites.map((url) => (
                        <div
                            key={url}
                            className="group flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#0050FF]/50 transition-all duration-300 shadow-sm"
                        >
                            <FaLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-medium max-w-[200px] truncate">{url}</span>
                            <button
                                type="button"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
                                onClick={() => onRemoveWebsite(url)}
                                aria-label={`Remove ${url}`}
                            >
                                <IoClose className="w-4 h-4 text-red-500 hover:text-red-600 transition-colors" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
