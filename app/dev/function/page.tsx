"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMintBaseCard } from "@/hooks/useMintBaseCard";
import { CreateBaseCardParams } from "@/lib/api/basecards";

const isDev = process.env.NODE_ENV === "development";

// Test data for minting
const TEST_FORM_DATA: Omit<CreateBaseCardParams, "profileImageFile"> = {
    nickname: "Test User",
    role: "Developer",
    bio: "This is a test bio for debugging purposes.",
    socials: {
        twitter: "testuser",
        github: "testuser",
        farcaster: "testuser",
    },
};

export default function DevFunctionPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const {
        mintCard,
        isCreatingBaseCard,
        isSendingTransaction,
        error: mintError,
    } = useMintBaseCard();

    // State for test results
    const [testResult, setTestResult] = useState<{
        success?: boolean;
        hash?: string;
        error?: string;
    } | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Custom form data state
    const [formData, setFormData] = useState(TEST_FORM_DATA);
    const [testImageFile, setTestImageFile] = useState<File | null>(null);

    // Redirect to home if not in development mode
    useEffect(() => {
        if (!isDev) {
            router.replace("/");
        }
    }, [router]);

    // Don't render in production
    if (!isDev) {
        return null;
    }

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => setLogs([]);

    // Create a test image file from a dummy canvas
    const createTestImageFile = (): File => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Create a gradient background
            const gradient = ctx.createLinearGradient(0, 0, 200, 200);
            gradient.addColorStop(0, "#0050FF");
            gradient.addColorStop(1, "#00D1FF");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 200, 200);

            // Add text
            ctx.fillStyle = "white";
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("TEST", 100, 105);
        }

        // Convert canvas to blob then file
        const dataURL = canvas.toDataURL("image/png");
        const byteString = atob(dataURL.split(",")[1]);
        const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        return new File([blob], "test-profile.png", { type: "image/png" });
    };

    // Test: Create BaseCard via Backend API only
    const testBackendApiOnly = async () => {
        if (!address) {
            addLog("❌ Wallet not connected");
            return;
        }

        addLog("🚀 Starting Backend API test...");
        addLog(`📍 Address: ${address}`);
        addLog(`📝 Form Data: ${JSON.stringify(formData, null, 2)}`);

        const imageFile = testImageFile || createTestImageFile();
        addLog(`🖼️ Image File: ${imageFile.name} (${imageFile.size} bytes)`);

        const params: CreateBaseCardParams = {
            ...formData,
            profileImageFile: imageFile,
        };

        try {
            const { createBaseCard } = await import("@/lib/api/basecards");
            addLog("⏳ Calling createBaseCard API...");

            const result = await createBaseCard(address, params);
            addLog("✅ Backend API Success!");
            addLog(`📦 Response: ${JSON.stringify(result, null, 2)}`);
            setTestResult({ success: true });
        } catch (error) {
            addLog(`❌ Backend API Error: ${error}`);
            setTestResult({
                success: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

    // Test: Full Minting Flow (Backend + Contract)
    const testFullMintingFlow = async () => {
        if (!address) {
            addLog("❌ Wallet not connected");
            return;
        }

        addLog("🚀 Starting Full Minting Flow test...");
        addLog(`📍 Address: ${address}`);
        addLog(`📝 Form Data: ${JSON.stringify(formData, null, 2)}`);

        const imageFile = testImageFile || createTestImageFile();
        addLog(`🖼️ Image File: ${imageFile.name} (${imageFile.size} bytes)`);

        const params: CreateBaseCardParams = {
            ...formData,
            profileImageFile: imageFile,
        };

        addLog("⏳ Calling mintCard hook...");

        const result = await mintCard(params);

        if (result.success) {
            addLog(`✅ Minting Success! Hash: ${result.hash}`);
            setTestResult({ success: true, hash: result.hash });
        } else {
            addLog(`❌ Minting Error: ${result.error}`);
            setTestResult({ success: false, error: result.error });
        }
    };

    // Test: Delete BaseCard
    const testDeleteBaseCard = async () => {
        if (!address) {
            addLog("❌ Wallet not connected");
            return;
        }

        addLog("🗑️ Deleting BaseCard for address: " + address);

        try {
            const { deleteBaseCard } = await import("@/lib/api/basecards");
            await deleteBaseCard(address);
            addLog("✅ BaseCard deleted successfully!");
        } catch (error) {
            addLog(`❌ Delete Error: ${error}`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTestImageFile(file);
            addLog(`📁 Selected file: ${file.name} (${file.size} bytes)`);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">
                    ⚙️ Function Test Page
                </h1>
                <p className="text-gray-400 mb-8">
                    Test useMintBaseCard hook and API functions
                </p>

                {/* Wallet Status */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <h2 className="text-lg font-bold mb-2">Wallet Status</h2>
                    <div className="flex items-center gap-4">
                        <span
                            className={`w-3 h-3 rounded-full ${
                                isConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                        <span>
                            {isConnected ? "Connected" : "Disconnected"}
                        </span>
                        {address && (
                            <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </code>
                        )}
                    </div>
                </div>

                {/* Hook State */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <h2 className="text-lg font-bold mb-2">Hook State</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-3 h-3 rounded-full ${
                                    isCreatingBaseCard
                                        ? "bg-yellow-500 animate-pulse"
                                        : "bg-gray-600"
                                }`}
                            />
                            <span>isCreatingBaseCard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-3 h-3 rounded-full ${
                                    isSendingTransaction
                                        ? "bg-yellow-500 animate-pulse"
                                        : "bg-gray-600"
                                }`}
                            />
                            <span>isSendingTransaction</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-3 h-3 rounded-full ${
                                    mintError ? "bg-red-500" : "bg-gray-600"
                                }`}
                            />
                            <span>error: {mintError || "null"}</span>
                        </div>
                    </div>
                </div>

                {/* Form Data Editor */}
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <h2 className="text-lg font-bold mb-4">Test Form Data</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Nickname
                            </label>
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        nickname: e.target.value,
                                    }))
                                }
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        role: e.target.value,
                                    }))
                                }
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                            >
                                <option value="Developer">Developer</option>
                                <option value="Designer">Designer</option>
                                <option value="Marketer">Marketer</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white resize-none"
                                rows={2}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">
                                Profile Image (optional - uses generated image
                                if empty)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                            />
                            {testImageFile && (
                                <p className="text-sm text-green-400 mt-1">
                                    ✓ {testImageFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={testBackendApiOnly}
                        disabled={
                            !isConnected ||
                            isCreatingBaseCard ||
                            isSendingTransaction
                        }
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl transition-colors"
                    >
                        🔧 Test Backend API Only
                    </button>
                    <button
                        onClick={testFullMintingFlow}
                        disabled={
                            !isConnected ||
                            isCreatingBaseCard ||
                            isSendingTransaction
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl transition-colors"
                    >
                        🚀 Test Full Minting
                    </button>
                    <button
                        onClick={testDeleteBaseCard}
                        disabled={
                            !isConnected ||
                            isCreatingBaseCard ||
                            isSendingTransaction
                        }
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl transition-colors"
                    >
                        🗑️ Delete BaseCard
                    </button>
                </div>

                {/* Test Result */}
                {testResult && (
                    <div
                        className={`rounded-xl p-4 mb-6 ${
                            testResult.success
                                ? "bg-green-900/50 border border-green-500"
                                : "bg-red-900/50 border border-red-500"
                        }`}
                    >
                        <h2 className="text-lg font-bold mb-2">
                            {testResult.success
                                ? "✅ Test Passed"
                                : "❌ Test Failed"}
                        </h2>
                        {testResult.hash && (
                            <p className="text-sm break-all">
                                Hash: {testResult.hash}
                            </p>
                        )}
                        {testResult.error && (
                            <p className="text-sm text-red-400">
                                Error: {testResult.error}
                            </p>
                        )}
                    </div>
                )}

                {/* Log Output */}
                <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">📋 Logs</h2>
                        <button
                            onClick={clearLogs}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <span className="text-gray-500">
                                No logs yet. Run a test to see output.
                            </span>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="text-green-400">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
