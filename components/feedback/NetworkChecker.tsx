"use client";

import { activeChain } from "@/lib/wagmi";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

/**
 * NetworkChecker Component
 *
 * Checks if the user is on the correct network based on the environment.
 * - Development: Base Sepolia (chainId: 84532)
 * - Production: Base Mainnet (chainId: 8453)
 *
 * If the user is on the wrong network, displays a modal with a switch button.
 */
export function NetworkChecker() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const [showModal, setShowModal] = useState(false);

    const requiredChainId = activeChain.id;
    const isCorrectChain = chainId === requiredChainId;

    // 한번만 나오게 바꿔야할 듯
    // console.log("🌐 Network Checker Debug:", {
    //     isDevelopment,
    //     activeChainName: activeChain.name,
    //     NEXT_PUBLIC_USE_TESTNET: process.env.NEXT_PUBLIC_USE_TESTNET,
    //     NODE_ENV: process.env.NODE_ENV,
    // });

    // Check network when user connects or changes
    useEffect(() => {
        const shouldShow = isConnected && address && !isCorrectChain;

        // 현재 상태와 다를 때만 업데이트
        if (shouldShow !== showModal) {
            setShowModal(Boolean(shouldShow));
        }
    }, [isConnected, address, isCorrectChain, showModal]);

    const handleSwitchNetwork = async () => {
        if (!switchChain) return;

        try {
            await switchChain({ chainId: requiredChainId });
            console.log(`✅ Switched to ${activeChain.name} successfully`);
            setShowModal(false);
        } catch (error) {
            console.error("❌ Failed to switch network:", error);
            // Modal stays open so user can try again
        }
    };

    // Don't show if not connected or on correct chain
    if (!showModal || !isConnected) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Wrong Network
                        </h2>
                        <p className="text-gray-600">
                            Please switch to the correct network to continue
                        </p>
                    </div>

                    {/* Network Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Current Network:
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                                Chain ID {chainId}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Required Network:
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                                {activeChain.name}
                            </span>
                        </div>
                    </div>

                    {/* Switch Button */}
                    <button
                        onClick={handleSwitchNetwork}
                        disabled={isSwitching}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {isSwitching ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Switching...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                    />
                                </svg>
                                <span>Switch to {activeChain.name}</span>
                            </>
                        )}
                    </button>

                    {/* Help Text */}
                    <p className="text-xs text-center text-gray-500">
                        {process.env.NODE_ENV === "development"
                            ? "💡 Development mode: Using Base Sepolia testnet"
                            : "You need to be on Base Mainnet to use this app"}
                    </p>
                </div>
            </div>
        </>
    );
}
