"use client";

import { AppConnectionRequired } from "@/components/common/AppConnectionRequired";
import BackButton from "@/components/common/BackButton";
import { MintButton } from "@/components/mint/MintButton";
import { MintErrorMessages } from "@/components/mint/MintErrorMessages";
import { MintHeader } from "@/components/mint/MintHeader";
import ProfileImagePreview from "@/components/mint/ProfileImagePreview";
import { RoleSelector } from "@/components/mint/RoleSelector";
import { SocialsInput } from "@/components/mint/SocialsInput";
import { WebsitesInput } from "@/components/mint/WebsitesInput";
import { useFrameContext } from "@/components/providers/FrameProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMintForm } from "@/hooks/mint/useMintForm";
import { useMintBaseCard } from "@/hooks/useMintBaseCard";
import { MAX_WEBSITES } from "@/lib/constants/mint";
import type { MintFormData } from "@/lib/schemas/mintFormSchema";
import FALLBACK_PROFILE_IMAGE from "@/public/assets/empty_pfp.png";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

// 모달 컴포넌트들을 lazy loading으로 처리 (필요할 때만 로드)
const ErrorModal = dynamic(
    () =>
        import("@/components/common/ErrorModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

const LoadingModal = dynamic(
    () =>
        import("@/components/common/LoadingModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

const SuccessModal = dynamic(
    () =>
        import("@/components/common/SuccessModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

const WarningModal = dynamic(
    () =>
        import("@/components/common/WarningModal").then((mod) => ({
            default: mod.default,
        })),
    {
        ssr: false,
    }
);

export default function Mint() {
    const frameContext = useFrameContext();
    const router = useRouter();
    const { address, isConnected } = useAccount();

    const username = (frameContext?.context as any)?.user?.username;
    const defaultProfileUrl =
        (frameContext?.context as any)?.user?.pfpUrl || FALLBACK_PROFILE_IMAGE;

    // Form state management
    const {
        form,
        fileInputRef,
        handleImageClick,
        handleFileChange,
        toggleSkill,
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

    // NFT minting hook (전체 플로우 포함)
    const {
        mintCard,
        isPending: isMintPending,
        isConfirming: isMintConfirming,
        isGenerating,
        error: mintError,
    } = useMintBaseCard();

    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState({
        title: "Error Occurred",
        description: "Something went wrong. Please try again.",
    });
    const [warningMessage, setWarningMessage] = useState({
        title: "Warning",
        description: "Please check your input.",
    });
    const [mintHash, setMintHash] = useState<string | undefined>();

    const handleCloseSuccessModal = useCallback(() => {
        setShowSuccessModal(false);
        router.push("/");
    }, [router]);

    const handleCloseErrorModal = useCallback(() => {
        setShowErrorModal(false);
    }, []);

    const handleCloseWarningModal = useCallback(() => {
        setShowWarningModal(false);
    }, []);

    const showError = useCallback((title: string, description: string) => {
        setErrorMessage({ title, description });
        setShowErrorModal(true);
    }, []);

    const showWarning = useCallback((title: string, description: string) => {
        setWarningMessage({ title, description });
        setShowWarningModal(true);
    }, []);

    // Form submit handler
    const onSubmit = useCallback(
        async (data: MintFormData) => {
            // Wallet validation
            if (!address) {
                showError(
                    "Wallet Not Connected",
                    "Please connect your wallet to create your card."
                );
                return;
            }

            if (!data.profileImageFile) {
                showError(
                    "Profile Image Required",
                    "Please upload a profile image."
                );
                return;
            }

            try {
                // Execute complete minting flow
                const result = await mintCard({
                    address: address,
                    nickname: data.name,
                    role: data.role,
                    bio: data.bio || "",
                    profileImageFile: data.profileImageFile,
                    socials: {
                        twitter: data.twitter || "",
                        github: data.github || "",
                        farcaster: data.farcaster || "",
                    },
                });

                if (result.success) {
                    setMintHash(result.hash);
                    setShowSuccessModal(true);
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
            <div className="bg-white text-black">
                <div className="relative">
                    <BackButton />
                </div>
                <AppConnectionRequired
                    title="Wallet Connection Required"
                    description="Please connect your Base Wallet to mint your card. This feature requires an active wallet connection."
                />
            </div>
        );
    }

    return (
        <main className="bg-white text-black scroll-container scrollbar-hide">
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
                        className="text-lg font-semibold text-gray-900"
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
                                : "border-gray-200 focus:border-[#0050FF] focus:ring-[#0050FF]/20 hover:border-gray-300"
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
                    twitterRegister={register("twitter")}
                    githubRegister={register("github")}
                    farcasterRegister={register("farcaster")}
                    errors={{
                        twitter: errors.twitter,
                        github: errors.github,
                        farcaster: errors.farcaster,
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

                {/* Base Name */}
                <div className="w-full space-y-2">
                    <Label
                        htmlFor="base_name_input"
                        className="text-lg font-semibold text-gray-900"
                    >
                        Base Name
                    </Label>
                    <Input
                        id="base_name_input"
                        type="text"
                        value={username || ""}
                        disabled
                        placeholder="Auto-filled from your wallet"
                        className="h-12 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 italic">
                        Automatically synced from your Base wallet
                    </p>
                </div>

                {/* 자기소개 */}
                <div className="w-full space-y-2">
                    <Label
                        htmlFor="bio"
                        className="text-lg font-semibold text-gray-900"
                    >
                        About Yourself
                    </Label>
                    <textarea
                        id="bio"
                        {...register("bio")}
                        className={`w-full p-4 text-base rounded-xl border-2 transition-all duration-300 resize-none placeholder:text-sm placeholder:text-gray-400 ${
                            errors.bio
                                ? "border-red-500 focus:border-red-600 focus:ring-red-500/20"
                                : "border-gray-200 focus:border-[#0050FF] focus:ring-[#0050FF]/20 hover:border-gray-300"
                        }`}
                        rows={4}
                        placeholder="Tell us about yourself, your experience, and goals..."
                    />
                    {errors.bio && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.bio.message}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 italic">
                        Optional - Share more about yourself
                    </p>
                </div>

                {/* 에러 메시지 */}
                {mintError && <MintErrorMessages mintError={mintError} />}

                {/* 민팅 버튼 */}
                <MintButton
                    isGenerating={isGenerating}
                    isMintPending={isMintPending}
                    isMintConfirming={isMintConfirming}
                    isMintSuccess={false}
                    isWalletNotReady={!isConnected}
                    hasAddress={!!address}
                    onSubmit={handleSubmit}
                />
            </form>

            {/* Loading Modal - Card Generation */}
            {isGenerating && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isGenerating}
                        title="Creating Your Card..."
                        description="We're designing your unique BaseCard"
                    />
                </Suspense>
            )}

            {/* Loading Modal - Preparing Transaction */}
            {isMintPending && !isGenerating && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isMintPending && !isGenerating}
                        title="Almost There..."
                        description="Please approve in your wallet"
                    />
                </Suspense>
            )}

            {/* Loading Modal - Confirming Transaction */}
            {isMintConfirming && (
                <Suspense fallback={null}>
                    <LoadingModal
                        isOpen={isMintConfirming}
                        title="Final Step..."
                        description="This will just take a moment"
                    />
                </Suspense>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <Suspense fallback={null}>
                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={handleCloseSuccessModal}
                        transactionHash={mintHash}
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

            {/* Warning Modal */}
            {showWarningModal && (
                <Suspense fallback={null}>
                    <WarningModal
                        isOpen={showWarningModal}
                        onClose={handleCloseWarningModal}
                        title={warningMessage.title}
                        description={warningMessage.description}
                    />
                </Suspense>
            )}
        </main>
    );
}
