import { minikitConfig } from "@/minikit.config";
import { Metadata } from "next";
import MainLayoutClient from "./MainLayoutClient";

const frame = {
    version: "next",
    imageUrl: minikitConfig.miniapp.imageUrl,
    button: {
        title: "Open",
        action: {
            type: "launch_frame",
            name: minikitConfig.miniapp.name,
            url: minikitConfig.miniapp.homeUrl,
            splashImageUrl: minikitConfig.miniapp.iconUrl,
            splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor
        }
    }
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: minikitConfig.miniapp.name,
        openGraph: {
            title: minikitConfig.miniapp.name,
            description: minikitConfig.miniapp.description,
            images: [minikitConfig.miniapp.imageUrl],
            url: minikitConfig.miniapp.homeUrl,
            siteName: minikitConfig.miniapp.name
        },
        other: {
            "fc:frame": JSON.stringify(frame),
            "fc:miniapp": JSON.stringify(frame),
        }
    };
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainLayoutClient>{children}</MainLayoutClient>;
}
