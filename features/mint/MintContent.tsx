"use client";

import BackButton from "@/components/buttons/BackButton";
import { MintButton } from "./components/MintButton";
import { MintErrorMessages } from "./components/MintErrorMessages";
import { MintHeader } from "./components/MintHeader";
import ProfileImagePreview from "./components/ProfileImagePreview";
import { RoleSelector } from "./components/RoleSelector";
import { SocialsInput } from "./components/SocialsInput";
import { WebsitesInput } from "./components/WebsitesInput";
import { WalletConnectionRequired } from "@/components/WalletConnectionRequired";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMintForm } from "@/hooks/useMintForm";
import { useMintBaseCard } from "@/hooks/useMintBaseCard";
import { MAX_WEBSITES } from "@/lib/constants/mint";
import type { MintFormData } from "@/lib/schemas/mintFormSchema";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { processProfileImage } from "@/lib/processProfileImage";
import { activeChain } from "@/lib/wagmi";
import { shareToFarcaster } from "@/lib/farcaster/share";

const ErrorModal = dynamic(
    () =>
        import("@/components/modals/ErrorModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

const LoadingModal = dynamic(
    () =>
        import("@/components/modals/LoadingModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

const BaseModal = dynamic(
    () =>
        import("@/components/modals/BaseModal").then((mod) => ({
            default: mod.BaseModal,
        })),
    {
        ssr: false,
    }
);

export default function MintContent() {
    const frameContext = useFrameContext();
    const router = useRouter();
    const { address, isConnected } = useAccount();

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

    // NFT minting hook
    const {
        mintCard,
        isCreatingBaseCard,
        isSendingTransaction,
        error: mintError,
    } = useMintBaseCard();

    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState({
        title: "Error Occurred",
        description: "Something went wrong. Please try again.",
    });
    const [mintHash, setMintHash] = useState<string | undefined>();
    const [mintImageUri, setMintImageUri] = useState<string | undefined>();

    const handleCloseErrorModal = useCallback(() => {
        setShowErrorModal(false);
    }, []);

    const showError = useCallback((title: string, description: string) => {
        setErrorMessage({ title, description });
        setShowErrorModal(true);
    }, []);

    // Form submit handler
    const onSubmit = useCallback(
        async (data: MintFormData) => {
            // Process profile image: use uploaded file or fallback to default URL
            const profileImage = await processProfileImage(
                data.profileImageFile ?? undefined,
                defaultProfileUrl
            );

            if (!profileImage) {
                showError(
                    "Profile Image Required",
                    "Please upload a profile image."
                );
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

                    setMintHash(result.hash);
                    setMintImageUri(result.imageUri);
                    setShowSuccessModal(true);
                } else if (result.error === "User rejected") {
                    // User rejected - do nothing, just return to form
                } else {
                    showError(
                        "Minting Failed",
                        result.error || "Failed to mint your card"
                    );
                }
            } catch (error) {
                console.error("❌ Card minting error:", error);
                showError(
                    "Something Went Wrong",
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred"
                );
            }
        },
        [address, username, defaultProfileUrl, mintCard, showError]
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
    useEffect(() => {
        if (urlError && newWebsite.trim()) {
            // 입력이 변경되면 에러 메시지 제거 (WebsitesInput에서도 처리)
            setUrlError(null);
        }
    }, [newWebsite, urlError]);

    const { errors } = formState;

    // 앱 연결이 필요한 경우 안내 화면 표시
    if (!address) {
        return (
            <WalletConnectionRequired
                title="Wallet Connection Required"
                description="Please connect your Base Wallet to mint your card. This feature requires an active wallet connection."
            />
        );
    }

    return (
        <main className="bg-white text-basecard-black scroll-container scrollbar-hide overscroll-y-none">
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
                    onRoleChange={(
                        value: "Developer" | "Designer" | "Marketer"
                    ) => setValue("role", value)}
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
                    onNewWebsiteChange={setNewWebsite}
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
                        className={`w-full p-4 text-base rounded-xl border-2 transition-all duration-300 resize-none placeholder:text-sm placeholder:text-gray-400 ${
                            errors.bio
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-basecard-blue focus:ring-basecard-blue/20 hover:border-gray-300"
                        }`}
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
                {mintError && <MintErrorMessages mintError={mintError} />}

                {/* 민팅 버튼 */}
                <MintButton
                    isGenerating={isCreatingBaseCard}
                    isMintPending={isSendingTransaction}
                    isMintConfirming={false}
                    isMintSuccess={false}
                    onSubmit={handleSubmit}
                />
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

            {/* Error Modal */}
            {showErrorModal && (
                <Suspense fallback={null}>
                    <ErrorModal
                        isOpen={showErrorModal}
                        onClose={handleCloseErrorModal}
                        title={errorMessage.title}
                        description={errorMessage.description}
                    />
                </Suspense>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <Suspense fallback={null}>
                    <BaseModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            router.push("/");
                        }}
                        title="Successfully Minted"
                        description="For now you can check your Base Card and transaction data"
                        buttonText="Share"
                        variant="success"
                        linkText="Open viewer"
                        onLinkClick={() => {
                            // Open block explorer transaction page
                            if (mintHash) {
                                const explorerUrl =
                                    activeChain.blockExplorers?.default.url;
                                window.open(
                                    `${explorerUrl}/tx/${mintHash}`,
                                    "_blank"
                                );
                            }
                        }}
                        onButtonClick={async () => {
                            // Share to Farcaster
                            await shareToFarcaster({
                                text: "I just minted my BaseCard! Check it out 🎉",
                                embedUrl: mintImageUri,
                            });
                            setShowSuccessModal(false);
                            router.push("/");
                        }}
                    />
                </Suspense>
            )}
        </main>
    );
}
