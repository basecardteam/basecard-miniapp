import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // webpack 설정: Turbo 모드(--turbo)를 사용하지 않을 때만 적용됩니다
    //
    // 📌 설정 설명:
    // 1. externals: 서버 사이드 전용 패키지를 클라이언트 번들에서 제외
    //    - pino-pretty, lokijs, encoding은 wagmi/viem의 간접 의존성일 수 있음
    //    - 클라이언트 번들 크기 감소 및 브라우저 호환성 문제 방지
    //
    // 2. resolve.fallback: React Native 모듈의 웹 환경 폴백 처리
    //    - @react-native-async-storage/async-storage, react-native
    //    - MetaMask SDK 등이 간접적으로 포함시킬 수 있음
    //    - 웹 환경에서 오류 방지를 위해 false로 설정
    //
    // ⚠️ 터보팩 사용 시:
    // - 이 webpack 설정은 무시됩니다 (Turbopack이 자동으로 최적화 처리)
    // - 빌드 오류 발생 시 필요한 부분만 Turbo 설정으로 추가하세요
    ...(process.env.TURBOPACK === undefined && {
        webpack: (config, { dev, isServer }) => {
            // 서버 사이드 전용 패키지를 클라이언트 번들에서 제외
            config.externals.push("pino-pretty", "lokijs", "encoding");

            // React Native 모듈의 웹 환경 폴백 처리
            config.resolve.fallback = {
                ...config.resolve.fallback,
                "@react-native-async-storage/async-storage": false,
                "react-native": false,
            };

            // 개발 환경 성능 최적화
            if (dev && !isServer) {
                config.optimization = {
                    ...config.optimization,
                    removeAvailableModules: false,
                    removeEmptyChunks: false,
                    splitChunks: false,
                };
            }

            return config;
        },
    }),
    images: {
        // remotePatterns: [
        //     {
        //         protocol: "https",
        //         hostname: "gateway.pinata.cloud",
        //         pathname: "/ipfs/**",
        //     },
        //     {
        //         protocol: "https",
        //         hostname: "*.mypinata.cloud",
        //     },
        //     {
        //         protocol: "https",
        //         hostname: "ipfs.io",
        //         pathname: "/ipfs/**",
        //     },
        //     {
        //         protocol: "https",
        //         hostname: "cloudflare-ipfs.com",
        //         pathname: "/ipfs/**",
        //     },
        //     {
        //         protocol: "https",
        //         hostname: "*.ipfs.dweb.link",
        //     },
        // ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // 모든 HTTPS 도메인 허용
                port: "",
                pathname: "/**",
            },
        ],
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
    },
    async redirects() {
        return [
            {
                source: "/.well-known/farcaster.json",
                destination: process.env.FARCASTER_REDIRECT_URL || "",
                permanent: true,
            },
        ];
    },
    allowedDevOrigins: [
        "*.ngrok-free.app",
        "https://basecard-git-dev1-4uphwangs-projects.vercel.app/",
        "app-dev.basecard.org",
    ],
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors *",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
