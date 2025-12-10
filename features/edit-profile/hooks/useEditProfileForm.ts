import { MAX_SKILLS, MAX_WEBSITES } from "@/lib/constants/mint";
import {
    mintFormSchema,
    type MintFormData,
} from "@/lib/schemas/mintFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";

/**
 * Edit Profile Form Hook
 */
export function useEditProfileForm(initialData?: Partial<MintFormData>) {
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
        mode: "onBlur",
    });

    const { watch, setValue, getValues } = form;

    // Image Click Handler
    const handleImageClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // File Change Handler
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setValue("profileImageFile", file, { shouldValidate: true });
            }
        },
        [setValue]
    );

    // Skill Toggle Handler
    const toggleSkill = useCallback(
        (
            skill: string,
            showWarning?: (title: string, description: string) => void
        ) => {
            const currentSkills = getValues("selectedSkills");

            if (currentSkills.includes(skill)) {
                setValue(
                    "selectedSkills",
                    currentSkills.filter((s) => s !== skill),
                    { shouldValidate: true }
                );
            } else {
                if (currentSkills.length >= MAX_SKILLS) {
                    showWarning?.(
                        "Maximum Skills Reached",
                        `You can select up to ${MAX_SKILLS} skills. Please deselect a skill to add a new one.`
                    );
                    return;
                }
                setValue("selectedSkills", [...currentSkills, skill], {
                    shouldValidate: true,
                });
            }
        },
        [getValues, setValue]
    );

    // Add Website Handler
    const handleAddWebsite = useCallback(
        (newWebsiteUrl: string) => {
            const currentWebsites = getValues("websites");
            const urlToAdd = newWebsiteUrl.trim();

            if (
                !urlToAdd ||
                currentWebsites.includes(urlToAdd) ||
                currentWebsites.length >= MAX_WEBSITES
            ) {
                return false;
            }

            try {
                new URL(urlToAdd);
                setValue("websites", [...currentWebsites, urlToAdd], {
                    shouldValidate: true,
                });
                return true;
            } catch {
                return false;
            }
        },
        [getValues, setValue]
    );

    // Remove Website Handler
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
