"use client";

import BaseCardLogoTypo from "@/public/baseCardTypo.png";
import { userProfileAtom } from "@/store/userProfileState";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BalanceDisplay from "../token/BalanceDisplay";
import UserProfileAvatar from "@/components/common/UserProfileAvatar";

export default function Header() {
    const router = useRouter();
    const [userProfile] = useAtom(userProfileAtom);

    const handleLogoClick = () => {
        router.push("/");
    };

    return (
        <div className="fixed top-0 z-50 flex-none w-full flex px-4 items-center justify-between border-b border-b-gray-200 bg-background-light h-[60px]">
            <div
                onClick={handleLogoClick}
                className="relative flex flex-shrink-0 h-10"
            >
                <Image
                    src={BaseCardLogoTypo}
                    alt="logo typo"
                    height={40}
                    className="object-contain"
                    priority
                />
            </div>

            <div className="ml-auto flex items-center gap-x-1 bg-white rounded-full">
                {/* 💡 h-8 대신 items-center를 사용하므로 h-8을 제거하거나, 필요하다면 유지 */}
                {/* BalanceDisplay: 세로 높이 h-8과 패딩을 명확히 함 */}
                <BalanceDisplay className="rounded-full pl-2 font-bold h-8 flex items-center " />

                {/* 프로필 이미지/이니셜 컨테이너: h-8 고정 */}
                <div className="h-8 flex-shrink-0">
                    <UserProfileAvatar
                        userProfile={userProfile}
                        className="w-8 h-8"
                    />
                </div>
            </div>
        </div>
    );
}
