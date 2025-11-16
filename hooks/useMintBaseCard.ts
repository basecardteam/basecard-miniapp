"use client";

import { useCardGeneration } from "@/hooks/useCardGeneration";
import { baseCardAbi } from "@/lib/abi/abi";
import { activeChain } from "@/lib/wagmi";
import { walletAddressAtom } from "@/store/walletState";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { decodeErrorResult, decodeEventLog } from "viem";
import {
    useAccount,
    useChainId,
    usePublicClient,
    useReadContract,
    useSwitchChain,
    useWriteContract
} from "wagmi";

const BASECARD_CONTRACT_ADDRESS = process.env
    .NEXT_PUBLIC_BASECARD_NFT_CONTRACT_ADDRESS! as `0x${string}`;

// 명시적으로 Base Sepolia (84532) 또는 Base Mainnet (8453) 체인 ID 지정
const REQUIRED_CHAIN_ID = process.env.NEXT_PUBLIC_USE_TESTNET === "true"
    ? 84532  // Base Sepolia
    : 8453;  // Base Mainnet

/**
 * BaseCard 민팅 입력 데이터 타입 (form에서 받는 데이터)
 */
export interface BaseCardMintInput {
    name: string;
    role: string;
    bio?: string;
    baseName?: string;
    address: string;
    profileImageFile?: File;
    defaultProfileUrl?: string | { src: string };
    skills?: string[];
    socials?: {
        twitter?: string;
        github?: string;
        farcaster?: string;
    };
}

/**
 * BaseCard 민팅 내부 데이터 타입 (이미지 처리 후)
 */
interface BaseCardMintData {
    imageURI: string; // IPFS URL (ipfs://...)
    nickname: string;
    role: string;
    bio: string;
    basename: string;
    socials?: {
        [key: string]: string;
    };
    ipfsId?: string; // Optional: ID for cleanup on failure
    userAddress?: string; // User wallet address for DB cleanup
}

/**
 * BaseCard 민팅 결과
 */
export interface MintResult {
    success: boolean;
    hash?: string;
    tokenId?: bigint;
    error?: string;
}

/**
 * BaseCard NFT 민팅을 위한 Hook
 *
 * @example
 * ```tsx
 * const { mintCard, isPending, isConfirming, isSuccess, error } = useMintBaseCard();
 *
 * const handleMint = async () => {
 *   const result = await mintCard({
 *     imageURI: "ipfs://QmXXX",
 *     nickname: "John Doe",
 *     role: "Developer",
 *     bio: "Full-stack developer",
 *     basename: "@johndoe",
 *     socials: { twitter: "@johndoe", github: "johndoe" }
 *   });
 *
 *   if (result.success) {
 *     console.log("Minted! Token ID:", result.tokenId);
 *   }
 * };
 * ```
 */
export function useMintBaseCard() {
    const [userAddress] = useAtom(walletAddressAtom);
    const [mintError, setMintError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Get current chain ID
    const chainId = useChainId();
    const { chain } = useAccount();
    const isCorrectChain = chainId === REQUIRED_CHAIN_ID;

    // Get public client for waiting transaction receipt
    const publicClient = usePublicClient();

    // Switch chain hook for network switching
    const { switchChainAsync } = useSwitchChain();

    // Card generation hook
    const { generateCard } = useCardGeneration();

    // Check if user has already minted
    const { data: hasMinted } = useReadContract({
        address: BASECARD_CONTRACT_ADDRESS,
        abi: baseCardAbi,
        functionName: "hasMinted",
        args: userAddress ? [userAddress] : undefined,
    });

    // writeContract hook for sending transaction
    const { writeContractAsync } = useWriteContract();

    /**
     * Update tokenId in database
     */
    const updateTokenIdInDatabase = useCallback(
        async (address: string, tokenId: number) => {
            try {
                console.log(`🔄 Updating tokenId in database: ${tokenId} for ${address}`);
                const response = await fetch(`/api/card/${address}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ tokenId }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to update tokenId");
                }

                console.log("✅ TokenId updated in database successfully");
            } catch (error) {
                console.error("TokenId update error:", error);
                throw error;
            }
        },
        []
    );

    /**
     * Extract tokenId from transaction receipt
     */
    const extractTokenIdFromReceipt = useCallback(
        (receipt: any): bigint | undefined => {
            try {
                // Find MintBaseCard event in logs
                for (const log of receipt.logs) {
                    try {
                        const decoded = decodeEventLog({
                            abi: baseCardAbi,
                            data: log.data,
                            topics: log.topics,
                        });

                        if (decoded.eventName === "MintBaseCard" && decoded.args) {
                            const args = decoded.args as unknown as {
                                tokenId: bigint;
                                user?: string;
                            };
                            const tokenId = args.tokenId;
                            console.log("✅ TokenId extracted from receipt:", tokenId);
                            return tokenId;
                        }
                    } catch (e) {
                        // Not the event we're looking for, continue
                        continue;
                    }
                }
            } catch (error) {
                console.error("❌ Error extracting tokenId from receipt:", error);
            }
            return undefined;
        },
        []
    );


    /**
     * Process image from File or URL
     */
    const processImage = useCallback(
        async (
            profileImageFile?: File,
            defaultProfileUrl?: string | { src: string }
        ): Promise<File | null> => {
            try {
                if (profileImageFile) {
                    return profileImageFile;
                }

                if (defaultProfileUrl) {
                    const urlString =
                        typeof defaultProfileUrl === "object" &&
                            "src" in defaultProfileUrl
                            ? defaultProfileUrl.src
                            : String(defaultProfileUrl);

                    const response = await fetch(urlString);
                    const blob = await response.blob();
                    return new File([blob], "profile-image.png", {
                        type: blob.type || "image/png",
                    });
                }

                return null;
            } catch (error) {
                console.error("Error processing image:", error);
                return null;
            }
        },
        []
    );

    /**
     * Save card to database
     */
    const saveCardToDatabase = useCallback(
        async (data: {
            nickname: string;
            role: string;
            bio: string;
            imageURI: string;
            basename: string;
            skills: string[];
            address: string;
            profileImage: string;
        }): Promise<{ success: boolean; cardId?: number; error?: string }> => {
            try {
                const response = await fetch("/api/cards", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to save card");
                }

                const savedCard = await response.json();
                return {
                    success: true,
                    cardId: savedCard.id,
                };
            } catch (error) {
                console.error("Database save error:", error);
                return {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to save to database",
                };
            }
        },
        []
    );

    /**
     * Clean up IPFS file
     */
    const cleanupIPFS = useCallback(async (ipfsId: string): Promise<void> => {
        try {
            console.log(`🗑️ Cleaning up IPFS file (ID: ${ipfsId})...`);
            const response = await fetch(`/api/ipfs/delete?id=${ipfsId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                console.log("✅ IPFS file cleaned up successfully");
            } else {
                console.warn("⚠️ Failed to clean up IPFS file");
            }
        } catch (error) {
            console.warn("⚠️ IPFS cleanup error:", error);
        }
    }, []);

    /**
     * Complete minting flow: 이미지 처리 → 카드 생성 → DB 저장 → 민팅
     */
    const mintCard = useCallback(
        async (input: BaseCardMintInput): Promise<MintResult> => {
            setMintError(null);
            setIsPending(false);
            setIsConfirming(false);
            setIsGenerating(false);
            setIsSaving(false);

            let ipfsId: string | undefined;
            let cardId: number | undefined;

            try {
                // 강제로 Base 테스트넷으로 전환 시도
                if (!switchChainAsync) {
                    throw new Error("Network switching is not available");
                }

                if (!publicClient) {
                    throw new Error("Public client is not available");
                }

                // 현재 체인 확인
                let currentChainId = await publicClient.getChainId();
                console.log(`🌐 Current network: ${currentChainId}, Required: ${REQUIRED_CHAIN_ID} (${activeChain.name})`);

                // 올바른 체인이 아니면 무조건 전환 시도
                if (currentChainId !== REQUIRED_CHAIN_ID) {
                    console.log(`🔄 Switching to ${activeChain.name} (${REQUIRED_CHAIN_ID})...`);

                    try {
                        // 명시적으로 Base 테스트넷으로 전환 요청
                        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
                        console.log(`✅ Network switch requested. Waiting for confirmation...`);

                        // 체인 전환 완료까지 대기 (더 긴 시간)
                        let attempts = 0;
                        const maxAttempts = 30; // 15초 대기
                        let switched = false;

                        while (attempts < maxAttempts) {
                            await new Promise((resolve) => setTimeout(resolve, 500));

                            try {
                                const actualChainId = await publicClient.getChainId();
                                console.log(`🔍 Checking chain... Current: ${actualChainId}, Required: ${REQUIRED_CHAIN_ID}`);

                                if (actualChainId === REQUIRED_CHAIN_ID) {
                                    console.log(`✅ Successfully switched to ${activeChain.name} (${actualChainId})`);
                                    switched = true;
                                    break;
                                }
                            } catch (e) {
                                console.warn("⚠️ Failed to get chain ID, retrying...", e);
                            }

                            attempts++;
                        }

                        // 최종 확인
                        if (!switched) {
                            const finalChainId = await publicClient.getChainId();
                            if (finalChainId !== REQUIRED_CHAIN_ID) {
                                throw new Error(
                                    `Network switch timeout. Current: ${finalChainId}, Required: ${REQUIRED_CHAIN_ID} (${activeChain.name}). Please switch manually.`
                                );
                            }
                        }
                    } catch (switchError) {
                        // 사용자 거부 확인
                        const isUserRejection =
                            switchError instanceof Error &&
                            (switchError.message.includes("User rejected") ||
                                switchError.message.includes("User denied") ||
                                switchError.message.includes("user rejected") ||
                                switchError.message.includes("rejected") ||
                                switchError.message.includes("User rejected the request") ||
                                switchError.message.includes("user rejected"));

                        if (isUserRejection) {
                            throw new Error(`Network switch was cancelled. Please switch to ${activeChain.name} (${REQUIRED_CHAIN_ID}) to continue.`);
                        }

                        // 최종 체인 확인 후 에러
                        const finalCheck = await publicClient.getChainId();
                        throw new Error(
                            switchError instanceof Error
                                ? `${switchError.message} (Current: ${finalCheck}, Required: ${REQUIRED_CHAIN_ID})`
                                : `Failed to switch to ${activeChain.name} (${REQUIRED_CHAIN_ID}). Current: ${finalCheck}. Please switch manually.`
                        );
                    }
                } else {
                    console.log(`✅ Already on correct network: ${activeChain.name} (${REQUIRED_CHAIN_ID})`);
                }

                // Check if user has already minted
                if (hasMinted) {
                    throw new Error(
                        "You have already minted a BaseCard. Each address can only mint once."
                    );
                }

                // Validate inputs
                if (!input.name || !input.role || !input.address) {
                    throw new Error("Required fields missing: name, role, address");
                }

                // Step 1: Process image
                console.log("🖼️ Processing image...");
                const imageToUse = await processImage(
                    input.profileImageFile,
                    input.defaultProfileUrl
                );

                if (!imageToUse) {
                    throw new Error("Failed to process image");
                }

                // Step 2: Generate card with IPFS upload
                console.log("🎨 Generating card and uploading to IPFS...");
                setIsGenerating(true);
                const generationResult = await generateCard(
                    {
                        name: input.name,
                        role: input.role,
                        baseName: input.baseName || "",
                        profileImage: imageToUse,
                    },
                    true // Upload to IPFS
                );
                setIsGenerating(false);

                if (!generationResult.success || !generationResult.ipfs) {
                    throw new Error(
                        generationResult.error ||
                        "Failed to generate card or upload to IPFS"
                    );
                }

                console.log(
                    "✅ Card generated successfully. IPFS CID:",
                    generationResult.ipfs.cid
                );

                const ipfsImageURI = `ipfs://${generationResult.ipfs.cid}`;
                ipfsId = generationResult.ipfs.id;

                // Step 3: Save to database
                console.log("💾 Saving card to database...");
                setIsSaving(true);
                const dbResult = await saveCardToDatabase({
                    nickname: input.name,
                    role: input.role,
                    bio: input.bio || "",
                    imageURI: ipfsImageURI,
                    basename: input.baseName || "",
                    skills: input.skills || [],
                    address: input.address,
                    profileImage: generationResult.profileImageBase64 || "",
                });
                setIsSaving(false);

                if (!dbResult.success) {
                    // Clean up IPFS on DB save failure
                    if (ipfsId) {
                        await cleanupIPFS(ipfsId);
                    }
                    throw new Error(dbResult.error || "Failed to save card to database");
                }

                cardId = dbResult.cardId;
                console.log("✅ Card saved to database. ID:", cardId);

                // 민팅 직전 최종 네트워크 체크 및 전환 시도
                if (!publicClient) {
                    // Clean up DB before throwing error
                    try {
                        console.log("🗑️ Cleaning up DB card due to missing public client...");
                        await fetch(`/api/card/${input.address}`, {
                            method: "DELETE",
                        });
                        console.log("✅ DB card cleaned up");
                    } catch (e) {
                        console.warn("⚠️ Failed to cleanup DB card:", e);
                    }
                    throw new Error("Public client is not available");
                }

                // 최종 체인 확인 및 필요시 재전환 시도
                let finalChainCheck = await publicClient.getChainId();
                console.log(`🔍 Final network check before minting: ${finalChainCheck} (Required: ${REQUIRED_CHAIN_ID})`);

                if (finalChainCheck !== REQUIRED_CHAIN_ID) {
                    console.log(`⚠️ Network mismatch detected! Attempting to switch again...`);

                    // 다시 한번 전환 시도
                    if (switchChainAsync) {
                        try {
                            await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
                            console.log(`🔄 Re-switching to ${activeChain.name} (${REQUIRED_CHAIN_ID})...`);

                            // 전환 대기
                            let retryAttempts = 0;
                            const maxRetryAttempts = 20;
                            while (retryAttempts < maxRetryAttempts) {
                                await new Promise((resolve) => setTimeout(resolve, 500));
                                finalChainCheck = await publicClient.getChainId();
                                if (finalChainCheck === REQUIRED_CHAIN_ID) {
                                    console.log(`✅ Successfully re-switched to ${activeChain.name}`);
                                    break;
                                }
                                retryAttempts++;
                            }
                        } catch (retryError) {
                            console.error("❌ Failed to re-switch network:", retryError);
                        }
                    }

                    // 최종 확인
                    finalChainCheck = await publicClient.getChainId();
                    if (finalChainCheck !== REQUIRED_CHAIN_ID) {
                        // Clean up DB before throwing error
                        try {
                            console.log("🗑️ Cleaning up DB card due to network mismatch...");
                            await fetch(`/api/card/${input.address}`, {
                                method: "DELETE",
                            });
                            console.log("✅ DB card cleaned up");
                        } catch (e) {
                            console.warn("⚠️ Failed to cleanup DB card:", e);
                        }
                        throw new Error(
                            `Network mismatch. Current: ${finalChainCheck}, Required: ${REQUIRED_CHAIN_ID} (${activeChain.name}). Please switch to ${activeChain.name} and try again.`
                        );
                    }
                }

                console.log(`✅ Network confirmed: ${activeChain.name} (${REQUIRED_CHAIN_ID})`);

                // Step 4: Mint NFT
                console.log("🎨 Minting NFT...");
                setIsPending(true);

                // Prepare social links
                const socialKeys: string[] = [];
                const socialValues: string[] = [];

                if (input.socials) {
                    Object.entries(input.socials).forEach(([key, value]) => {
                        if (value && value.trim() !== "") {
                            // Convert "twitter" to "x" for contract compatibility
                            const contractKey = key === "twitter" ? "x" : key;
                            socialKeys.push(contractKey);
                            socialValues.push(value.trim());
                        }
                    });
                }

                // Prepare card data tuple
                const initialCardData = {
                    imageURI: ipfsImageURI,
                    nickname: input.name,
                    role: input.role,
                    bio: input.bio || "",
                    basename: input.baseName || "",
                };

                // Validate contract address
                if (
                    !BASECARD_CONTRACT_ADDRESS ||
                    BASECARD_CONTRACT_ADDRESS === "0x"
                ) {
                    throw new Error("Contract address not configured");
                }

                if (!writeContractAsync) {
                    throw new Error("writeContractAsync is not available");
                }

                if (!publicClient) {
                    throw new Error("Public client is not available");
                }

                // Call smart contract and wait for hash
                console.log("📝 Sending transaction...");
                const hash = await writeContractAsync({
                    address: BASECARD_CONTRACT_ADDRESS,
                    abi: baseCardAbi,
                    functionName: "mintBaseCard",
                    args: [initialCardData, socialKeys, socialValues],
                });

                console.log("✅ Transaction sent. Hash:", hash);
                setIsPending(false);
                setIsConfirming(true);

                // Wait for transaction receipt
                console.log("⏳ Waiting for transaction confirmation...");
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash,
                });

                console.log("✅ Transaction confirmed!");

                // Extract tokenId from receipt
                const tokenId = extractTokenIdFromReceipt(receipt);

                if (!tokenId) {
                    // Clean up DB if tokenId extraction failed
                    if (cardId && input.address) {
                        try {
                            console.log("🗑️ Cleaning up DB card due to tokenId extraction failure...");
                            await fetch(`/api/card/${input.address}`, {
                                method: "DELETE",
                            });
                            console.log("✅ DB card cleaned up");
                        } catch (e) {
                            console.warn("Failed to cleanup DB card:", e);
                        }
                    }
                    throw new Error("Failed to extract tokenId from transaction receipt");
                }

                // Update tokenId in database
                await updateTokenIdInDatabase(input.address, Number(tokenId));

                setIsConfirming(false);

                return {
                    success: true,
                    hash,
                    tokenId,
                };
            } catch (error) {
                console.error("❌ Mint error:", error);
                setIsPending(false);
                setIsConfirming(false);
                setIsGenerating(false);
                setIsSaving(false);

                // 에러 디코딩 시도
                let errorMessage = "Failed to mint BaseCard";

                if (error instanceof Error) {
                    errorMessage = error.message;

                    // viem 에러에서 데이터 추출 시도 (여러 위치 확인)
                    const errorObj = error as any;
                    const errorData =
                        errorObj?.data ||
                        errorObj?.cause?.data ||
                        errorObj?.cause?.cause?.data ||
                        errorObj?.shortMessage?.match(/data="(0x[a-fA-F0-9]+)"/)?.[1];

                    console.log("🔍 Error data found:", errorData);
                    console.log("🔍 Full error object:", errorObj);

                    if (errorData && typeof errorData === "string" && errorData.startsWith("0x")) {
                        try {
                            const decoded = decodeErrorResult({
                                abi: baseCardAbi,
                                data: errorData as `0x${string}`,
                            });

                            console.log("✅ Decoded contract error:", decoded);

                            // 디코딩된 에러에 따라 메시지 설정
                            switch (decoded.errorName) {
                                case "AlreadyMinted":
                                    errorMessage = "이미 BaseCard를 민팅하셨습니다. 각 주소는 한 번만 민팅할 수 있습니다.";
                                    break;
                                case "NotAllowedSocialKey":
                                    errorMessage = "허용되지 않은 소셜 미디어 키입니다. 허용된 키: x, farcaster, website, github, linkedin";
                                    break;
                                case "InvalidTokenId":
                                    errorMessage = "유효하지 않은 토큰 ID입니다.";
                                    break;
                                default:
                                    errorMessage = `컨트랙트 에러: ${decoded.errorName}`;
                            }
                        } catch (decodeError) {
                            console.warn("⚠️ Failed to decode error:", decodeError);
                            console.warn("⚠️ Error data:", errorData);

                            // 에러 코드로 직접 확인 (0xddefae28 = AlreadyMinted)
                            if (errorData === "0xddefae28" || errorData.startsWith("0xddefae28")) {
                                errorMessage = "이미 BaseCard를 민팅하셨습니다. 각 주소는 한 번만 민팅할 수 있습니다.";
                            }
                        }
                    } else if (errorMessage.includes("0xddefae28") || errorMessage.includes("ddefae28")) {
                        // 에러 메시지에 에러 코드가 포함된 경우
                        errorMessage = "이미 BaseCard를 민팅하셨습니다. 각 주소는 한 번만 민팅할 수 있습니다.";
                    }
                }

                // Check if user rejected the transaction
                const isUserRejection =
                    error instanceof Error &&
                    (error.message.includes("User rejected") ||
                        error.message.includes("User denied") ||
                        error.message.includes("user rejected") ||
                        error.message.includes("rejected") ||
                        error.message.includes("User rejected the request") ||
                        error.message.includes("Network switch was cancelled"));

                // Clean up resources on failure (except user rejection)
                if (!isUserRejection) {
                    // Clean up IPFS
                    if (ipfsId) {
                        console.log("🗑️ Cleaning up IPFS file...");
                        await cleanupIPFS(ipfsId);
                    }

                    // Clean up DB card (always delete if minting failed)
                    if (input.address) {
                        try {
                            console.log("🗑️ Cleaning up DB card due to minting failure...");
                            const deleteResponse = await fetch(`/api/card/${input.address}`, {
                                method: "DELETE",
                            });
                            if (deleteResponse.ok) {
                                console.log("✅ DB card cleaned up successfully");
                            } else {
                                console.warn("⚠️ Failed to cleanup DB card");
                            }
                        } catch (e) {
                            console.warn("⚠️ Failed to cleanup DB card:", e);
                        }
                    }
                }

                setMintError(errorMessage);

                return {
                    success: false,
                    error: errorMessage,
                };
            }
        },
        [
            chainId,
            chain,
            isCorrectChain,
            hasMinted,
            writeContractAsync,
            publicClient,
            switchChainAsync,
            generateCard,
            processImage,
            saveCardToDatabase,
            cleanupIPFS,
            extractTokenIdFromReceipt,
            updateTokenIdInDatabase,
        ]
    );


    return {
        mintCard,
        isPending, // Transaction is being prepared
        isConfirming, // Transaction is being confirmed
        isGenerating, // Card is being generated
        isSaving, // Card is being saved to database
        error: mintError,
        hasMinted, // Check if user has already minted
        isCorrectChain, // Check if on correct chain
        chainId, // Current chain ID
        requiredChainId: REQUIRED_CHAIN_ID, // Required chain ID (명시적: 84532 또는 8453)
        chainName: activeChain.name, // Chain name for display
    };
}
