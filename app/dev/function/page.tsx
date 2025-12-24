"use client";

import BaseButton from "@/components/buttons/BaseButton";
import { useModal } from "@/components/modals/BaseModal";
import { ShareResult, shareToFarcaster } from "@/lib/farcaster/share";
import { activeChain } from "@/lib/wagmi";
import { useState } from "react";

export default function FunctionTestPage() {
    const { showModal } = useModal();
    const [mockImageUrl, setMockImageUrl] = useState(
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
    );
    const [mockEmbedUrl, setMockEmbedUrl] = useState(
        "https://miniapp.basecard.org/basecard/0x1234567890123456789012345678901234567890"
    );
    const [castResult, setCastResult] = useState<ShareResult | null>(null);

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

    // Test Cast Card with 2 embeds (imageUrl + embedUrl)
    const testCastCard = async () => {
        console.log("Testing Cast Card with embeds:", {
            imageUrl: mockImageUrl,
            embedUrl: mockEmbedUrl,
        });
        setCastResult(null);

        const result = await shareToFarcaster({
            imageUrl: mockImageUrl,
            embedUrl: mockEmbedUrl,
            // text is omitted to use DEFAULT_SHARE_TEXT
        });

        console.log("Cast result:", result);
        setCastResult(result);
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

            {/* Cast Card Test - Tests imageUrl + embedUrl embeds */}
            <div className="flex flex-col gap-4 border-t pt-4">
                <h2 className="text-xl font-semibold">Cast Card Test</h2>
                <p className="text-sm text-gray-600">
                    Tests composeCast with 2 embeds: imageUrl (first) + embedUrl
                    (second)
                </p>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                        Image URL (embed 1)
                    </label>
                    <input
                        type="text"
                        value={mockImageUrl}
                        onChange={(e) => setMockImageUrl(e.target.value)}
                        className="p-2 border rounded text-sm"
                        placeholder="IPFS gateway URL for card image"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                        Embed URL (embed 2)
                    </label>
                    <input
                        type="text"
                        value={mockEmbedUrl}
                        onChange={(e) => setMockEmbedUrl(e.target.value)}
                        className="p-2 border rounded text-sm"
                        placeholder="Mini app card URL"
                    />
                </div>
                <BaseButton onClick={testCastCard}>Test Cast Card</BaseButton>
                {castResult && (
                    <div className="p-3 bg-gray-100 rounded text-sm">
                        <pre>{JSON.stringify(castResult, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
