import PreventPullToRefresh from "@/components/utils/PreventPullToRefresh";
import { minikitConfig } from "@/minikit.config";
import type { Metadata } from "next";
import { Viewport } from "next";
import { Inter, K2D } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export async function generateMetadata(): Promise<Metadata> {
    return {
        icons: {
            icon: "/bc-icon.png",
            apple: "/bc-icon.png",
        },
        other: {
            // prod: "base:app_id": "6943ae91d77c069a945bdfec",
            // dev: "base:app_id": "69434d13d19763ca26ddc3cb",
            "base:app_id": "69434d13d19763ca26ddc3cb",
            "fc:miniapp": JSON.stringify({
                version: "next",
                imageUrl: minikitConfig.miniapp.embedImageUrl,
                button: {
                    title: minikitConfig.miniapp.buttonTitle,
                    action: {
                        type: "launch_miniapp",
                        name: minikitConfig.miniapp.name,
                        url: minikitConfig.miniapp.homeUrl,
                        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
                        splashBackgroundColor:
                            minikitConfig.miniapp.splashBackgroundColor,
                    },
                },
            }),
        },
    };
}

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
                    {children}
                </Providers>
            </body>
        </html>
    );
}
