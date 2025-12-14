"use client";

import BackButton from "@/components/buttons/BackButton";
// Reuse Mint Button style? Or custom
import { WalletConnectionRequired } from "@/components/WalletConnectionRequired";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileImagePreview from "@/features/mint/components/ProfileImagePreview";
import { RoleSelector } from "@/features/mint/components/RoleSelector";
import { SocialsInput } from "@/features/mint/components/SocialsInput";
import { WebsitesInput } from "@/features/mint/components/WebsitesInput";
import { useMyBaseCard } from "@/hooks/useMyBaseCard";
import { useUser } from "@/hooks/useUser";
import { MAX_WEBSITES } from "@/lib/constants/mint";
import type { MintFormData } from "@/lib/schemas/mintFormSchema";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useEditProfileForm } from "./hooks/useEditProfileForm";

const BaseModal = dynamic(
    () =>
        import("@/components/modals/BaseModal").then((mod) => ({
            default: mod.BaseModal,
        })),
    {
        ssr: false,
    }
);

export default function EditProfileContent() {
    const frameContext = useFrameContext();
    const router = useRouter();
    const { address } = useAccount();
    const { data: user } = useUser();

    const username = (frameContext?.context as MiniAppContext)?.user?.username;
    // Default image if no card data
    const defaultProfileUrl =
        (frameContext?.context as MiniAppContext)?.user?.pfpUrl ||
        FALLBACK_PROFILE_IMAGE;

    // Fetch existing card data
    const { data: cardData, isLoading: isCardLoading } = useMyBaseCard();

    // Form state
    const {
        form,
        fileInputRef,
        handleImageClick,
        handleFileChange,
        handleAddWebsite,
        handleRemoveWebsite,
        watch,
    } = useEditProfileForm();

    const { handleSubmit: formHandleSubmit, setValue, formState, reset } = form;
    const { register } = form;

    const role = watch("role");
    const websites = watch("websites");
    const profileImageFile = watch("profileImageFile");

    // Populate form when cardData is available
    useEffect(() => {
        if (cardData) {
            console.log("Populating form with card data:", cardData);
            reset({
                name: cardData.nickname || "",
                role: (cardData.role as any) || undefined, // Type cast if necessary
                bio: cardData.bio || "",
                github: cardData.socials?.github || "",
                twitter: cardData.socials?.twitter || "",
                farcaster: cardData.socials?.farcaster || "",
                websites: [], // Card data doesn't seem to have websites in the example JSON?
                // If it does, map it here. The provided JSON doesn't show it.
                selectedSkills: [], // Also not in JSON
                profileImageFile: null, // Can't prepopulate file input, but Preview handles URL
            });
            // We need to ensure ProfileImagePreview handles the 'preview' correctly if it's a URL
            // The ProfileImagePreview component usually takes a file or a default URL.
            // We should overwrite 'defaultProfileUrl' logic effectively for visual.
        }
    }, [cardData, reset]);

    // Use user profile image as default source for preview
    const activeProfileUrl = user?.profileImage || defaultProfileUrl;

    const [newWebsite, setNewWebsite] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);

    // Reuse website logic
    const handleAddWebsiteWithValidation = useCallback(() => {
        const urlToAdd = newWebsite.trim();
        if (!urlToAdd) {
            setUrlError("Please enter a website URL");
            return;
        }

        let isValidUrl = false;
        try {
            new URL(urlToAdd);
            isValidUrl = true;
        } catch {
            setUrlError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        const currentWebsites = form.getValues("websites");
        if (currentWebsites.includes(urlToAdd)) {
            setUrlError("This website is already in your list");
            return;
        }

        if (currentWebsites.length >= MAX_WEBSITES) {
            setUrlError(`Maximum ${MAX_WEBSITES} websites allowed`);
            return;
        }

        const success = handleAddWebsite(urlToAdd);
        if (success) {
            setNewWebsite("");
            setUrlError(null);
        }
    }, [newWebsite, handleAddWebsite, form]);

    useEffect(() => {
        if (urlError && newWebsite.trim()) {
            setUrlError(null);
        }
    }, [newWebsite, urlError]);

    const { errors } = formState;

    if (!address) {
        return (
            <WalletConnectionRequired
                title="Wallet Connection Required"
                description="Please connect your Base Wallet to edit your profile."
            />
        );
    }

    const onSubmit = (data: MintFormData) => {
        console.log("Saving data:", data);
        // Here we would call the update API.
        // For now, toggle success modal.
        setShowSuccessModal(true);
    };

    const handleSubmit = formHandleSubmit(onSubmit);

    if (isCardLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        );
    }

    return (
        <main className="bg-white text-basecard-black scroll-container scrollbar-hide overscroll-y-none">
            <div className="relative">
                <BackButton />
            </div>

            {/* Custom Header for Edit Profile */}
            <div className="flex flex-col items-center justify-center mt-2 mb-8">
                <h1 className="text-[24px] font-bold font-k2d">Edit Profile</h1>
                <p className="text-gray-500 text-sm">
                    Update your BaseCard details
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-start px-5 py-4 gap-y-6"
            >
                {/* Profile Image - using activeProfileUrl which prefers card image */}
                <ProfileImagePreview
                    profileImageFile={profileImageFile || null}
                    defaultProfileUrl={activeProfileUrl}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    handleImageClick={handleImageClick}
                />

                {/* Name */}
                <div className="w-full space-y-2">
                    <Label
                        htmlFor="name"
                        className="text-lg font-semibold text-basecard-black"
                    >
                        Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="Enter your name"
                        className={`h-12 text-base rounded-xl border-2 transition-all duration-300 ${
                            errors.name
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Role */}
                <RoleSelector
                    selectedRole={role}
                    onRoleChange={(value: any) => setValue("role", value)}
                />

                {/* Socials */}
                <SocialsInput
                    baseName={username}
                    twitterRegister={register("twitter")}
                    githubRegister={register("github")}
                    farcasterRegister={register("farcaster")}
                    linkedinRegister={register("linkedin")}
                    errors={{
                        twitter: errors.twitter,
                        github: errors.github,
                        farcaster: errors.farcaster,
                        linkedin: errors.linkedin,
                    }}
                />

                {/* Websites */}
                <WebsitesInput
                    websites={websites}
                    newWebsite={newWebsite}
                    onNewWebsiteChange={setNewWebsite}
                    onAddWebsite={handleAddWebsiteWithValidation}
                    onRemoveWebsite={handleRemoveWebsite}
                    urlError={urlError}
                />

                {/* Bio */}
                <div className="w-full space-y-2">
                    <Label
                        htmlFor="bio"
                        className="text-lg font-semibold text-basecard-black"
                    >
                        About Yourself
                    </Label>
                    <textarea
                        id="bio"
                        {...register("bio")}
                        className={`w-full p-4 text-base rounded-xl border-2 transition-all duration-300 resize-none placeholder:text-sm placeholder:text-gray-400 ${
                            errors.bio
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                        }`}
                        rows={4}
                        placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.bio.message}
                        </p>
                    )}
                </div>

                {/* Submit Button - Custom text */}
                <button
                    type="submit"
                    className="w-full h-[56px] bg-basecard-blue rounded-[16px] flex items-center justify-center gap-2 text-white font-k2d font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg active:scale-[0.98]"
                >
                    Save Changes
                </button>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <Suspense fallback={null}>
                    <BaseModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            router.push("/my-base-card");
                        }}
                        title="Profile Updated"
                        description="Your profile changes have been saved successfully (Dummy)."
                        buttonText="Okay"
                        variant="success"
                    />
                </Suspense>
            )}
        </main>
    );
}
