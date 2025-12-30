import { useAuth } from "@/components/providers/AuthProvider";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";
import { useToast } from "@/components/ui/Toast";
import { useMyQuests } from "@/hooks/api/useMyQuests";
import { useUser } from "@/hooks/api/useUser";
import { verifyQuestByAction } from "@/lib/api/quests";
import {
    executeAction,
    getAutoVerifiableActions,
    QuestActionContext,
} from "@/lib/quest-actions";
import {
    clearPendingAction,
    getPendingActionTypes,
    setPendingAction,
} from "@/lib/quest/questPendingActions";
import { Quest } from "@/lib/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

// =============================================================================
// Types
// =============================================================================

interface UseQuestHandlerResult {
    handleQuestAction: (quest: Quest) => Promise<void>;
    verifiableActions: string[];
    isProcessing: boolean;
    processingMessage: string;
    successModalState: {
        isOpen: boolean;
        rewarded: number;
        newTotalPoints: number;
    };
    setSuccessModalState: React.Dispatch<
        React.SetStateAction<{
            isOpen: boolean;
            rewarded: number;
            newTotalPoints: number;
        }>
    >;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Quest Action Handler
 *
 * 1. verifiableActions 계산 (auto + pending)
 * 2. handleQuestAction: 상태에 따라 claim/verify/action 실행
 */
export function useQuestHandler(): UseQuestHandlerResult {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { address } = useAccount();
    const { card } = useUser();
    const { showToast } = useToast();
    const frameContext = useFrameContext();
    const isInMiniApp = frameContext?.isInMiniApp ?? false;
    const frameContextData = frameContext?.context;
    const { claim } = useMyQuests();
    const { accessToken } = useAuth();

    // -----------------------------------------
    // State
    // -----------------------------------------
    const [pendingActions, setPendingActions] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("");
    const [successModalState, setSuccessModalState] = useState({
        isOpen: false,
        rewarded: 0,
        newTotalPoints: 0,
    });

    // -----------------------------------------
    // Verifiable Actions 계산
    // -----------------------------------------
    const verifiableActions = useMemo(() => {
        const socials = card?.socials ?? {};
        const auto = getAutoVerifiableActions({
            hasCard: !!card,
            socials,
        });
        const merged = [...new Set([...pendingActions, ...auto])];

        console.log("[QuestHandler] verifiableActions:", {
            auto,
            pendingActions,
            merged,
        });
        return merged;
    }, [card, pendingActions]);

    // -----------------------------------------
    // Visibility API: 앱 복귀 시 pending → verifiable
    // -----------------------------------------
    useEffect(() => {
        if (typeof document === "undefined") return;

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                const pending = getPendingActionTypes();
                if (pending.length > 0) {
                    setPendingActions((prev) => [
                        ...new Set([...prev, ...pending]),
                    ]);
                }
                queryClient.refetchQueries({ queryKey: ["userQuests"] });
            }
        };

        // 마운트 시 체크
        onVisible();

        document.addEventListener("visibilitychange", onVisible);
        return () =>
            document.removeEventListener("visibilitychange", onVisible);
    }, [queryClient]);

    // -----------------------------------------
    // Action Context (외부 액션용)
    // -----------------------------------------
    const clientFid = (frameContextData as MiniAppContext)?.client?.clientFid;

    const actionContext: QuestActionContext = useMemo(
        () => ({
            cardId: card?.id ?? "",
            address,
            accessToken: accessToken ?? undefined,
            cardImageUri: card?.imageUri ?? undefined,
            isInMiniApp,
            clientContext: clientFid ? { clientFid } : undefined,
        }),
        [card?.id, card?.imageUri, address, accessToken, isInMiniApp, clientFid]
    );

    // -----------------------------------------
    // Helpers
    // -----------------------------------------
    const doVerify = useCallback(
        async (actionType: string) => {
            if (!accessToken) return null;
            const result = await verifyQuestByAction(actionType, accessToken);

            // Refetch to update UI & Points
            await queryClient.refetchQueries({ queryKey: ["userQuests"] });
            if (result.verified) {
                await queryClient.refetchQueries({ queryKey: ["user"] });
            }

            clearPendingAction(actionType);
            setPendingActions((prev) => prev.filter((a) => a !== actionType));
            return result;
        },
        [accessToken, queryClient]
    );

    const showSuccess = useCallback(
        (rewarded: number, newTotalPoints: number) => {
            setSuccessModalState({ isOpen: true, rewarded, newTotalPoints });
        },
        []
    );

    // -----------------------------------------
    // Main Handler
    // -----------------------------------------
    const handleQuestAction = useCallback(
        async (quest: Quest) => {
            const { actionType, status } = quest;
            console.log(
                "[QuestHandler] action:",
                actionType,
                "status:",
                status
            );

            // 1️⃣ Claimable → Claim
            if (status === "claimable") {
                setIsProcessing(true);
                setProcessingMessage("Claiming reward...");
                try {
                    const result = await claim(quest);
                    if (result?.verified) {
                        showSuccess(
                            result.rewarded ?? 0,
                            result.newTotalPoints ?? 0
                        );
                    }
                } catch (err) {
                    showToast(
                        err instanceof Error ? err.message : "Failed to claim",
                        "error"
                    );
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // 2️⃣ Verifiable → Verify
            if (verifiableActions.includes(actionType)) {
                setIsProcessing(true);
                setProcessingMessage("Verifying quest...");
                try {
                    const result = await doVerify(actionType);
                    showToast(
                        result?.verified
                            ? "Quest verified! Claim your reward."
                            : "Verification failed.",
                        result?.verified ? "success" : "error"
                    );
                } catch (err) {
                    showToast(
                        err instanceof Error
                            ? err.message
                            : "Verification failed",
                        "error"
                    );
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // 3️⃣ Generic Action Execution

            // Execute action
            const result = await executeAction(actionType, actionContext);

            if (result.success) {
                // Navigation
                if (result.navigateTo) {
                    router.push(result.navigateTo);
                    return;
                }

                // A. Optimistic Pending (클라이언트 상태만 변경)
                if (result.shouldSetPending) {
                    setPendingAction(actionType);
                    setPendingActions((prev) => [
                        ...new Set([...prev, actionType]),
                    ]);
                }
                // B. Immediate Verify (API 호출)
                else if (result.shouldVerifyImmediately) {
                    try {
                        const verifyResult = await doVerify(actionType);
                        if (verifyResult?.verified) {
                            showToast(
                                "Quest verified! Claim your reward.",
                                "success"
                            );
                        }
                    } catch {
                        // verify 실패해도 action은 성공했을 수 있음
                    }
                }

                if (result.data) {
                    // 결과 데이터 처리
                }
            } else {
                showToast(result.error ?? "Action failed", "error");
            }
            return;

            // 4️⃣ Fallback: Unknown action
            showToast("Action not supported", "error");
        },
        [
            claim,
            doVerify,
            verifiableActions,
            router,
            showToast,
            actionContext,
            showSuccess,
        ]
    );

    return {
        handleQuestAction,
        verifiableActions,
        isProcessing,
        processingMessage,
        successModalState,
        setSuccessModalState,
    };
}
