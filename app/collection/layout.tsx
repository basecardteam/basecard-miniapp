import Header from "@/components/layouts/Header";

export default function CollectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <Header />
            <main className="flex-1 pt-[var(--header-h,60px)] h-screen">
                {children}
            </main>
        </div>
    );
}