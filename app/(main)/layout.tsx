"use client";

import FooterNav from "@/components/layouts/FooterNav";
import Header from "@/components/layouts/Header";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full flex flex-col h-dvh overflow-hidden max-w-xl mx-auto">
            <Header />
            <main className="scroll-container scrollbar-hide pt-[var(--header-h,60px)] pb-[var(--bottom-nav-h,64px)]">
                {children}
            </main>
            <FooterNav />
        </div>
    );
}
