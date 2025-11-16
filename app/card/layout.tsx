"use client";

import Header from "@/components/layouts/Header";

export default function CardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-[var(--header-h,60px)]">
                {children}
            </main>
        </div>
    );
}

