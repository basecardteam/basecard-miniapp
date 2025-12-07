"use client";

import Image from "next/image";
import BaseCardLogoTypo from "@/public/baseCardTypo.png";
import { useUser } from "@/hooks/useUser";
import BackButton from "@/components/buttons/BackButton";
import UserProfileAvatar from "@/components/avatars/UserProfileAvatar";
import { cn } from "@/lib/utils";

export default function QuestHeader() {
    const { data: user } = useUser();

    return (
        <div className="w-full flex items-center justify-between px-4 h-[60px] absolute top-0 left-0 z-10 bg-transparent">
            {/* Logo */}
            <div className="relative flex flex-shrink-0 h-10">
                <Image
                    src={BaseCardLogoTypo}
                    alt="logo typo"
                    height={40}
                    className="object-contain brightness-0 invert" // Make logo white if it's black, assuming typo is black text
                    priority
                />
            </div>

            {/* 1000 BC Pill */}
            <div className="flex flex-row items-center bg-white rounded-full h-[33px] px-1 gap-2">
                <span className="font-k2d font-bold text-[14px] text-[#303030] pl-3">
                    {user?.totalPoints?.toLocaleString() ?? 0} BC
                </span>
                <div className="w-[26px] h-[26px] relative">
                    <UserProfileAvatar className="w-full h-full rounded-full" />
                </div>
            </div>
        </div>
    );
}
