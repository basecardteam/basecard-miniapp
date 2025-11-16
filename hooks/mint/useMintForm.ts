import { MAX_SKILLS, MAX_WEBSITES } from "@/lib/constants/mint";
import { mintFormSchema, type MintFormData } from "@/lib/schemas/mintFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";

/**
 * Mint 폼 상태 관리 훅 (React Hook Form 사용)
 */
export function useMintForm(initialData?: Partial<MintFormData>) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<MintFormData>({
        resolver: zodResolver(mintFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            role: initialData?.role || undefined,
            bio: initialData?.bio || "",
            github: initialData?.github || "",
            farcaster: initialData?.farcaster || "",
            twitter: initialData?.twitter || "",
            websites: initialData?.websites || [],
            selectedSkills: initialData?.selectedSkills || [],
            profileImageFile: initialData?.profileImageFile || null,
        },
        mode: "onBlur", // 성능 최적화: onBlur 시에만 유효성 검사 (onChange 대신)
    });

    const { watch, setValue, getValues } = form;

    // 이미지 클릭 핸들러
    const handleImageClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // 파일 변경 핸들러
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("profileImageFile", file, { shouldValidate: true });
        }
    }, [setValue]);

    // 스킬 토글 핸들러
    const toggleSkill = useCallback(
        (skill: string, showWarning?: (title: string, description: string) => void) => {
            const currentSkills = getValues("selectedSkills");

            if (currentSkills.includes(skill)) {
                // 제거
                setValue(
                    "selectedSkills",
                    currentSkills.filter((s) => s !== skill),
                    { shouldValidate: true }
                );
            } else {
                // 추가
                if (currentSkills.length >= MAX_SKILLS) {
                    showWarning?.(
                        "Maximum Skills Reached",
                        `You can select up to ${MAX_SKILLS} skills. Please deselect a skill to add a new one.`
                    );
                    return;
                }
                setValue(
                    "selectedSkills",
                    [...currentSkills, skill],
                    { shouldValidate: true }
                );
            }
        },
        [getValues, setValue]
    );

    // 웹사이트 추가 핸들러
    const handleAddWebsite = useCallback((newWebsiteUrl: string) => {
        const currentWebsites = getValues("websites");
        const urlToAdd = newWebsiteUrl.trim();

        if (!urlToAdd || currentWebsites.includes(urlToAdd) || currentWebsites.length >= MAX_WEBSITES) {
            return false;
        }

        try {
            // URL 유효성 검사
            new URL(urlToAdd);
            setValue(
                "websites",
                [...currentWebsites, urlToAdd],
                { shouldValidate: true }
            );
            return true;
        } catch {
            // URL 형식이 잘못된 경우
            return false;
        }
    }, [getValues, setValue]);

    // 웹사이트 제거 핸들러
    const handleRemoveWebsite = useCallback(
        (urlToRemove: string) => {
            const currentWebsites = getValues("websites");
            setValue(
                "websites",
                currentWebsites.filter((url) => url !== urlToRemove),
                { shouldValidate: true }
            );
        },
        [getValues, setValue]
    );

    return {
        form,
        fileInputRef,
        handleImageClick,
        handleFileChange,
        toggleSkill,
        handleAddWebsite,
        handleRemoveWebsite,
        watch,
    };
}
