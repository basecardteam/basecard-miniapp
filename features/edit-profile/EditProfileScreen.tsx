"use client";

import BackButton from "@/components/buttons/BackButton";
// Reuse Mint Button style? Or custom
import { WalletConnectionRequired } from "@/components/WalletConnectionRequired";
import BaseButton from "@/components/buttons/BaseButton";
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
import { useUser } from "@/hooks/api/useUser";
import type { MintFormData } from "@/lib/schemas/mintFormSchema";
import { User } from "@/lib/types/api";
import defaultProfileImage from "@/public/assets/default-profile.png";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useEditProfileForm } from "./hooks/useEditProfileForm";

import { processProfileImage } from "@/lib/processProfileImage";
import { useEditBaseCard } from "./hooks/useEditBaseCard";

const BaseModal = dynamic(
    () =>
        import("@/components/modals/BaseModal").then((mod) => ({
            default: mod.BaseModal,
        })),
    {
        ssr: false,
    }
);

const LoadingModal = dynamic(
    () =>
        import("@/components/modals/FullScreenLoadingOverlay").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

export default function EditProfileScreen() {
    const frameContext = useFrameContext();
    const router = useRouter();
    const { address } = useAccount();
    const {
        editCard,
        isCreatingBaseCard,
        isSendingTransaction,
        error: editError,
    } = useEditBaseCard();

    const username = (frameContext?.context as MiniAppContext)?.user?.username;
    const profileImage =
        (frameContext?.context as MiniAppContext)?.user?.pfpUrl ||
        defaultProfileImage;

    // Fetch existing card data
    const { card: cardData, isPending: isCardLoading } = useUser();
    const queryClient = useQueryClient();

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
            reset({
                name: cardData.nickname || "",
                role: (cardData.role as any) || undefined,
                bio: cardData.bio || "",
                github: cardData.socials?.github || "",
                x: cardData.socials?.x || "",
                farcaster: cardData.socials?.farcaster || "",
                linkedin: cardData.socials?.linkedin || "",
                websites: [],
                selectedSkills: [],
                profileImageFile: null,
            });
        }
    }, [cardData, reset]);

    const [newWebsite, setNewWebsite] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // WebsitesInput에서 실시간 검증하므로 여기서는 단순히 추가만
    const handleAddWebsiteSimple = useCallback(() => {
        const urlToAdd = newWebsite.trim();
        if (!urlToAdd) return;

        const success = handleAddWebsite(urlToAdd);
        if (success) {
            setNewWebsite("");
        }
    }, [newWebsite, handleAddWebsite]);

    const { errors } = formState;
    222;
    if (!address) {
        return (
            <WalletConnectionRequired
                title="Wallet Connection Required"
                description="Please connect your Base Wallet to edit your profile."
            />
        );
    }

    const onSubmit = async (data: MintFormData) => {
        if (!cardData?.id) {
            setSubmitError("Card not found");
            return;
        }

        setSubmitError(null);

        const socials: Record<string, string> = {};
        if (data.github) socials.github = data.github;
        if (data.x) socials.x = data.x;
        if (data.farcaster) socials.farcaster = data.farcaster;
        if (data.linkedin) socials.linkedin = data.linkedin;

        const processedImage = await processProfileImage(profileImage);

        const result = await editCard({
            nickname: data.name,
            role: data.role,
            bio: data.bio || "",
            socials: Object.keys(socials).length > 0 ? socials : {},
            profileImageFile: processedImage,
        });

        if (result.success) {
            setShowSuccessModal(true);
        } else if (result.error && result.error !== "User rejected") {
            setSubmitError(result.error);
        }
    };

    const handleSubmit = formHandleSubmit(onSubmit);

    if (isCardLoading) {
        return (
            <div className="flex items-center justify-center h-screen"></div>
        );
    }

    return (
        <main className="bg-white text-basecard-black scroll-container scrollbar-hide overscroll-y-none pb-20">
            <div className="relative flex items-center h-12">
                <BackButton />
                <h1 className="text-lg font-medium ml-12">Edit Profile</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-start px-5 gap-y-6"
            >
                {/* Profile Image */}
                <ProfileImagePreview
                    defaultProfileUrl={profileImage}
                    profileImageFile={profileImageFile || null}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    handleImageClick={handleImageClick}
                />

                {/* Name */}
                <div className="w-full space-y-1">
                    <Label
                        htmlFor="name"
                        className="text-base font-semibold text-basecard-black gap-0"
                    >
                        Your Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="Enter your name"
                        className={`h-12 text-sm rounded-xl border-2 transition-all duration-300 placeholder:text-sm placeholder:text-basecard-gray ${
                            errors.name
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
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
                    xRegister={register("x")}
                    githubRegister={register("github")}
                    farcasterRegister={register("farcaster")}
                    linkedinRegister={register("linkedin")}
                    errors={{
                        x: errors.x,
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
                    onAddWebsite={handleAddWebsiteSimple}
                    onRemoveWebsite={handleRemoveWebsite}
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
                        className={`w-full p-3 bg-white text-base rounded-xl border-2 placeholder:text-sm placeholder:text-gray-400 ${
                            errors.bio
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : ""
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

                {/* Error Message */}
                {submitError && (
                    <p className="text-red-500 text-sm text-center w-full">
                        {submitError}
                    </p>
                )}

                <BaseButton
                    type="submit"
                    disabled={isCreatingBaseCard || isSendingTransaction}
                    className="py-5 text-lg rounded-lg shadow-xl fixed bottom-5 left-0 right-0 mx-5"
                >
                    {isCreatingBaseCard
                        ? "Updating..."
                        : isSendingTransaction
                        ? "Confirming..."
                        : "Save"}
                </BaseButton>
            </form>

            {/* Loading Modal - Card Generation */}
            {isCreatingBaseCard && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isCreatingBaseCard}
                        title="Updating Your Card..."
                        description="We're processing your profile changes"
                    />
                </Suspense>
            )}

            {/* Loading Modal - Sending Transaction */}
            {isSendingTransaction && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isSendingTransaction}
                        title="Almost There..."
                        description="Please approve in your wallet"
                    />
                </Suspense>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <Suspense fallback={null}>
                    <BaseModal
                        isOpen={showSuccessModal}
                        onClose={async () => {
                            setShowSuccessModal(false);
                            // Refetch both user and quests so QuestList can check updated socials
                            // Optimistically update query cache with form data
                            queryClient.setQueryData(
                                ["user"],
                                (oldData: User | null | undefined) => {
                                    if (!oldData || !oldData.card)
                                        return oldData;
                                    const formValues = form.getValues();
                                    return {
                                        ...oldData,
                                        card: {
                                            ...oldData.card,
                                            nickname: formValues.name,
                                            role: formValues.role,
                                            bio: formValues.bio,
                                            socials: {
                                                github:
                                                    formValues.github ||
                                                    undefined,
                                                x: formValues.x || undefined,
                                                farcaster:
                                                    formValues.farcaster ||
                                                    undefined,
                                                linkedin:
                                                    formValues.linkedin ||
                                                    undefined,
                                            },
                                            // Update image if available (this is tricky as we have File not URL)
                                            // But standard flow might update it later via background refetch
                                        },
                                    };
                                }
                            );

                            await Promise.all([
                                queryClient.invalidateQueries({
                                    queryKey: ["user"],
                                }),
                                queryClient.invalidateQueries({
                                    queryKey: ["userQuests"],
                                }),
                            ]);
                            router.push("/basecard");
                        }}
                        title="Profile Updated"
                        description="Your profile changes have been saved on blockchain."
                        buttonText="Okay"
                        variant="success"
                    />
                </Suspense>
            )}
        </main>
    );
}
