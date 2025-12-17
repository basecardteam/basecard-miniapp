"use client";

import BackButton from "@/components/buttons/BackButton";
import BaseButton from "@/components/buttons/BaseButton";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { useMintBaseCardMutation } from "@/hooks/useMintBaseCardMutation";
import { useMintForm } from "@/hooks/useMintForm";
import { MAX_WEBSITES, type Role } from "@/lib/constants/mint";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { processProfileImage } from "@/lib/processProfileImage";
import type { MintFormData } from "@/lib/schemas/mintFormSchema";
import type { Card } from "@/lib/types/api";
import { activeChain } from "@/lib/wagmi";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MintErrorMessages } from "./components/MintErrorMessages";
import { MintHeader } from "./components/MintHeader";
import MintSuccessModal from "./components/MintSuccessModal";
import ProfileImagePreview from "./components/ProfileImagePreview";
import { RoleSelector } from "./components/RoleSelector";
import { SocialsInput } from "./components/SocialsInput";
import { WebsitesInput } from "./components/WebsitesInput";

const LoadingModal = dynamic(
    () =>
        import("@/components/modals/FullScreenLoadingOverlay").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

export default function MintContent() {
    const frameContext = useFrameContext();
    const router = useRouter();
    const { address } = useAccount();
    const { showToast } = useToast();
    const queryClient = useQueryClient();


    const username = (frameContext?.context as MiniAppContext)?.user?.username;
    const defaultProfileUrl =
        (frameContext?.context as MiniAppContext)?.user?.pfpUrl ||
        FALLBACK_PROFILE_IMAGE;

    // Form state management
    const {
        form,
        fileInputRef,
        handleImageClick,
        handleFileChange,
        handleAddWebsite,
        handleRemoveWebsite,
        watch,
    } = useMintForm();

    const { handleSubmit: formHandleSubmit, setValue, formState } = form;
    const { register } = form;

    // Watch 복잡한 필드들만 (register로 관리되지 않는 필드)
    const role = watch("role");
    const websites = watch("websites");
    const profileImageFile = watch("profileImageFile");

    // Temporary field for new website input (not in schema)
    const [newWebsite, setNewWebsite] = useState("");

    // NFT minting mutation hook
    const {
        mutateAsync: mintCard,
        isCreatingBaseCard,
        isSendingTransaction,
        isMining,
        error: mintError,
    } = useMintBaseCardMutation();

    // Success modal state
    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        txHash: string;
        imageUri: string;
        isExisting: boolean;
    }>({ isOpen: false, txHash: "", imageUri: "", isExisting: false });

    // Form submit handler
    const onSubmit = useCallback(
        async (data: MintFormData) => {
            // Process profile image: use uploaded file or fallback to default URL
            const profileImage = await processProfileImage(
                data.profileImageFile ?? undefined,
                defaultProfileUrl
            );

            if (!profileImage) {
                showToast("Please upload a profile image.", "error");
                return;
            }

            try {
                // Execute complete minting flow
                const result = await mintCard({
                    nickname: data.name,
                    role: data.role,
                    bio: data.bio || "",
                    profileImageFile: profileImage,
                    socials: {
                        twitter: data.twitter || "",
                        github: data.github || "",
                        farcaster: data.farcaster || "",
                    },
                });

                if (result.success) {
                    // Clear all cached storage data for fresh start
                    if (typeof window !== "undefined") {
                        localStorage.clear();
                        sessionStorage.clear();
                    }

                    setSuccessModal({
                        isOpen: true,
                        txHash: result.hash || "",
                        imageUri: result.imageUri || "",
                        isExisting: result.isExisting || false,
                    });
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred";

                // Handle "User rejected" specifically if it was thrown
                if (errorMessage === "User rejected") {
                    showToast("Transaction cancelled", "warning");
                } else {
                    console.error("❌ Card minting error:", error);
                    showToast(errorMessage, "error");
                }
            }
        },
        [defaultProfileUrl, mintCard, showToast]
    );

    // Wrapper for form submit (with wallet validation)
    const handleSubmit = formHandleSubmit(onSubmit);

    // URL 에러 상태 (모달 대신 인라인 메시지로 표시)
    const [urlError, setUrlError] = useState<string | null>(null);

    // Handle add website (with URL validation) - 모달 대신 인라인 에러 표시
    const handleAddWebsiteWithValidation = useCallback(() => {
        const urlToAdd = newWebsite.trim();
        if (!urlToAdd) {
            setUrlError("Please enter a website URL");
            return;
        }

        // URL 유효성 검사
        let isValidUrl = false;
        try {
            new URL(urlToAdd);
            isValidUrl = true;
        } catch {
            setUrlError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        // 이미 추가된 URL인지 확인
        const currentWebsites = form.getValues("websites");
        if (currentWebsites.includes(urlToAdd)) {
            setUrlError("This website is already in your list");
            return;
        }

        // 최대 개수 확인
        if (currentWebsites.length >= MAX_WEBSITES) {
            setUrlError(`Maximum ${MAX_WEBSITES} websites allowed`);
            return;
        }

        // 모든 검사 통과 시 추가
        const success = handleAddWebsite(urlToAdd);
        if (success) {
            setNewWebsite("");
            setUrlError(null);
        }
    }, [newWebsite, handleAddWebsite, form]);

    // 입력 시 에러 메시지 초기화
    const handleNewWebsiteChange = useCallback(
        (value: string) => {
            setNewWebsite(value);
            if (urlError) {
                setUrlError(null);
            }
        },
        [urlError]
    );

    const { errors } = formState;

    // 지갑 연결이 안 되어 있으면 메인 화면으로 리다이렉트
    useEffect(() => {
        if (!address) {
            router.push("/");
        }
    }, [address, router]);

    if (!address) {
        return null;
    }

    return (
        <main className="bg-white text-basecard-black scroll-container scrollbar-hide overscroll-y-none relative">
            <div className="relative">
                <BackButton />
            </div>
            <MintHeader hasMinted={false} />

            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-start px-5 py-4 gap-y-6"
            >
                {/* 프로필 이미지 영역 */}
                <ProfileImagePreview
                    profileImageFile={profileImageFile || null}
                    defaultProfileUrl={defaultProfileUrl}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    handleImageClick={handleImageClick}
                />

                {/* 이름 입력 */}
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

                {/* 역할 선택 */}
                <RoleSelector
                    selectedRole={role}
                    onRoleChange={(value: Role) => setValue("role", value)}
                />

                {/* 소셜 링크 입력 */}
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

                {/* 웹사이트 입력 */}
                <WebsitesInput
                    websites={websites}
                    newWebsite={newWebsite}
                    onNewWebsiteChange={handleNewWebsiteChange}
                    onAddWebsite={handleAddWebsiteWithValidation}
                    onRemoveWebsite={handleRemoveWebsite}
                    urlError={urlError}
                />

                {/* 자기소개 */}
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
                        className={`w-full bg-white p-4 rounded-xl border-2 transition-all min-h-20 max-h-60 duration-300 ${
                            errors.bio
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                        } placeholder:text-sm placeholder:text-gray-400 `}
                        rows={4}
                        placeholder="Tell us about yourself, your experience, and goals..."
                    />
                    {errors.bio && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.bio.message}
                        </p>
                    )}
                    <p className="text-sm text-basecard-gray italic">
                        Optional - Share more about yourself
                    </p>
                </div>

                {/* 에러 메시지 */}
                {/* Error handling is now done via Toast or logic inside submit, 
                    but if we want to show persistent error from hook (e.g. simulation fail) */}
                {mintError && (
                    <MintErrorMessages
                        mintError={
                            mintError instanceof Error
                                ? mintError.message
                                : mintError
                        }
                    />
                )}

                {/* 민팅 버튼 */}
                <BaseButton
                    type="submit"
                    onClick={handleSubmit}
                    disabled={
                        isCreatingBaseCard || isSendingTransaction || isMining
                    }
                    className="w-full py-6 text-lg rounded-2xl shadow-xl mt-6"
                >
                    Create My Card
                </BaseButton>
            </form>

            {/* Loading Modal - Card Generation */}
            {isCreatingBaseCard && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isCreatingBaseCard}
                        title="Creating Your Card..."
                        description="We're designing your unique BaseCard"
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
            <MintSuccessModal
                isOpen={successModal.isOpen}
                txHash={successModal.txHash}
                explorerUrl={activeChain.blockExplorers?.default.url || ""}
                isExisting={successModal.isExisting}
                onViewCard={() => {
                    setSuccessModal((prev) => ({ ...prev, isOpen: false }));
                    router.push("/");
                }}
                onShare={async () => {
                    const freshCardData = await queryClient.fetchQuery<Card | null>({
                        queryKey: ["myBaseCard", address],
                        staleTime: 0,
                    });

                    await shareToFarcaster({
                        text: "I just minted my BaseCard! Check it out 🎉",
                        embedUrl: resolveIpfsUrl(
                            freshCardData?.imageUri
                        ),
                    });
                    router.push("/");
                }}
            />
        </main>
    );
}
