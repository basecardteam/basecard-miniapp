"use client";

import BaseCardLogoTypo from "@/public/baseCardTypo.png";
import { userProfileAtom } from "@/store/userProfileState";
import sdk from "@farcaster/miniapp-sdk";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BalanceDisplay from "../token/BalanceDisplay";

export default function Header() {
    const router = useRouter();
    const [userProfile] = useAtom(userProfileAtom);
    const { actions } = sdk;

    const fixedColor1 = getFixedColorForUser(userProfile.fid ? Number(userProfile.fid) : 0, 0);
    const fixedColor2 = getFixedColorForUser(userProfile.fid ? Number(userProfile.fid) : 0, 1);

    const backgroundStyle = `linear-gradient(45deg, ${fixedColor1}, ${fixedColor2})`;
    const initial = (userProfile?.displayName || userProfile?.fid)?.toString().charAt(0).toUpperCase() || '';

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
                    {
                        userProfile?.pfpUrl && userProfile?.fid
                            ? <div
                                onClick={() => actions.viewProfile({ fid: userProfile.fid! })}
                                className=""
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={userProfile.pfpUrl}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            </div>
                            : <div
                                style={{ background: backgroundStyle }}
                                className="w-8 h-8 rounded-full flex justify-center items-center text-lg font-bold text-white flex-shrink-0"
                            >
                                {initial}
                            </div>
                    }
                </div>
            </div>
        </div >
    );
}


/**
 * FID (숫자)를 시드로 사용하여 항상 같은 랜덤 값 (0~1)을 반환하는 결정론적 함수
 */
function getDeterministicRandom(seed: number) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

/**
 * FID와 인덱스를 기반으로 고정된 CSS Hex 색상을 생성합니다.
 */
function getFixedColorForUser(fid: number, index: number) {
    if (!fid) return "#CCCCCC"; // FID가 없으면 기본 회색 반환

    const seed = fid * 10 + index;
    const randomValue = getDeterministicRandom(seed);
    const colorNumber = Math.floor(randomValue * 16777215);

    // Hex 문자열로 변환하고 6자리로 채움
    const hex = colorNumber.toString(16).padStart(6, '0').toUpperCase();

    return `#${hex}`;
}
