"use client";

import { Coins, Home, IdCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/basecard", label: "My Card", icon: IdCard },
    { href: "/", label: "Home", icon: Home },
    { href: "/earn", label: "Earn", icon: Coins },
];

export default function FooterNav() {
    const pathname = usePathname();

    const footerClasses =
        "absolute bottom-0 left-0 right-0 border-t bg-white z-50";

    const footerStyle = {
        height: "var(--bottom-nav-h, 64px)",
        paddingBottom: "var(--safe-bottom, 0px)",
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
                                ${
                                    pathname === item.href
                                        ? "text-basecard-blue font-bold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            <IconComponent className="text-xl" />
                            <span className="mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </footer>
    );
}
