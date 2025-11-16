"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsCreditCard } from 'react-icons/bs';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { GoHomeFill } from 'react-icons/go';

const navItems = [
    { href: '/mycard', label: 'My BaseCard', icon: BsCreditCard },
    { href: '/', label: 'Home', icon: GoHomeFill },
    { href: '/earn', label: 'Earn', icon: FaMoneyBillAlt },
];

export default function FooterNav() {
    const pathname = usePathname();

    const footerClasses = "flex-none fixed bottom-0 left-0 right-0 border-t bg-white z-50";

    const footerStyle = {
        height: 'var(--bottom-nav-h, 64px)',
        paddingBottom: 'var(--safe-bottom, 0px)',
        backgroundColor: '#ffffff',
    };

    return (
        <footer
            className={footerClasses}
            style={footerStyle}
        >
            <nav className="flex justify-around mx-auto h-full">
                {navItems.map((item) => {
                    const IconComponent = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center p-2 text-xs transition-colors text-center flex-1 
                                ${pathname === item.href ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`
                            }
                        >
                            <IconComponent className="text-xl" />
                            <span className="mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </footer>
    );
}

