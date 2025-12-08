import BalanceDisplay from "../token/BalanceDisplay";
import UserProfileAvatar from "@/components/avatars/UserProfileAvatar";

export default function ConnectedUserDisplay() {
    return (
        <div className="flex items-center gap-1">
            {/* BalanceDisplay: 세로 높이 h-8과 패딩을 명확히 함 */}
            <BalanceDisplay className="rounded-full pl-2 font-bold h-8 flex items-center " />

            {/* 프로필 이미지/이니셜 컨테이너: h-8 고정 */}
            <div className="h-8 flex-shrink-0">
                <UserProfileAvatar className="w-8 h-8" />
            </div>
        </div>
    );
}
