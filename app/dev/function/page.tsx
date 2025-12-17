"use client";

import BaseButton from "@/components/buttons/BaseButton";
import { useModal } from "@/components/modals/BaseModal";
import { shareToFarcaster } from "@/lib/farcaster/share";
import { activeChain } from "@/lib/wagmi";
import { useState } from "react";

export default function FunctionTestPage() {
    const { showModal } = useModal();
    const [mockImageUrl, setMockImageUrl] = useState(
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
    );

    const testMintSuccessModal = () => {
        // Mock result object
        const result = {
            success: true,
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Dummy Hash
            imageUri: mockImageUrl,
        };

        console.log("Testing Mint Success Modal with result:", result);

        showModal({
            title: "Successfully Minted",
            description:
                "For now you can check your Base Card and transaction data",
            buttonText: "Share",
            variant: "success",
            linkText: "Open viewer",
            onLinkClick: () => {
                if (result.hash) {
                    const explorerUrl =
                        activeChain.blockExplorers?.default.url ||
                        "https://sepolia.basescan.org";
                    window.open(`${explorerUrl}/tx/${result.hash}`, "_blank");
                }
            },
            onButtonClick: async () => {
                console.log("Share button clicked. imageUri:", result.imageUri);
                if (!result.imageUri) {
                    alert("Error: imageUri is empty!");
                    return;
                }
                await shareToFarcaster({
                    text: "I just minted my BaseCard! Check it out 🎉",
                    embedUrl: result.imageUri,
                });
                // router.push("/"); // Don't redirect in test page
                alert("Share triggered! Check console for details.");
            },
        });
    };

    return (
        <div className="p-8 flex flex-col gap-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Function Test Playground</h1>

            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Mint Success Modal</h2>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                        Mock Image URI
                    </label>
                    <input
                        type="text"
                        value={mockImageUrl}
                        onChange={(e) => setMockImageUrl(e.target.value)}
                        className="p-2 border rounded"
                        placeholder="Enter image URL to test"
                    />
                </div>
                <BaseButton onClick={testMintSuccessModal}>
                    Open Success Modal
                </BaseButton>
                <p className="text-sm text-gray-500">
                    Click "Share" in the modal to verify the image URI is passed
                    correctly.
                </p>
            </div>
        </div>
    );
}
