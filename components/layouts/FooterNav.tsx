"use client";

import { Coins, Home, IdCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbLicense } from "react-icons/tb";
import {
    MiniAppContext,
    useFrameContext,
} from "@/components/providers/FrameProvider";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/basecard", label: "My Card", icon: IdCard },
    { href: "/quest", label: "Quest", icon: TbLicense },
    { href: "/earn", label: "Earn", icon: Coins },
];

export default function FooterNav() {
    const pathname = usePathname();
    const frameContext = useFrameContext();
    const safeAreaBottom =
        (frameContext?.context as MiniAppContext)?.client?.safeAreaInsets
            ?.bottom ?? 0;

    console.log("[FooterNav] safeAreaInsets:", (frameContext?.context as MiniAppContext)?.client?.safeAreaInsets);
    console.log("[FooterNav] safeAreaBottom:", safeAreaBottom, "→ total height:", 64 + safeAreaBottom);

    const footerClasses =
        "absolute bottom-0 left-0 right-0 border-t bg-white z-50";

    const footerStyle = {
        height: `${64 + safeAreaBottom}px`,
        paddingBottom: `${safeAreaBottom}px`,
        backgroundColor: "#ffffff",
    };

    return (
        <footer className={footerClasses} style={footerStyle}>
            <nav className="flex justify-around mx-auto h-full">
                {navItems.map((item) => {
                    const IconComponent = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center p-2 text-xs transition-colors text-center flex-1 
                                ${pathname === item.href
                                    ? "text-basecard-blue font-bold"
                                    : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            <IconComponent size={24} />
                            <span className="mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </footer>
    );
}
