import { minikitConfig } from "@/minikit.config";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import type { Metadata } from "next";
import { Viewport } from "next";
import { Inter, K2D } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PreventPullToRefresh from "@/components/utils/PreventPullToRefresh";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const k2d = K2D({
    variable: "--font-k2d",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0,
    minimumScale: 1.0,
    userScalable: false,
};

export const metadata: Metadata = {
    title: minikitConfig.miniapp.name,
    openGraph: {
        title: minikitConfig.miniapp.name,
        description: minikitConfig.miniapp.description,
        images: [minikitConfig.miniapp.imageUrl],
        url: minikitConfig.miniapp.homeUrl,
        siteName: minikitConfig.miniapp.name,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${k2d.variable}`}>
            <body>
                <Providers>
                    <PreventPullToRefresh />
                    <SafeArea>{children}</SafeArea>
                </Providers>
            </body>
        </html>
    );
}
