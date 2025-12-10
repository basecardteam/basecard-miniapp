import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // -------------------------------------------------------------------------
    // Output 설정 (Docker 배포용)
    // -------------------------------------------------------------------------
    // standalone 모드는 node_modules 없이 배포 가능한 최소 패키지를 생성합니다.
    output: "standalone",

    // -------------------------------------------------------------------------
    // Turbopack 설정 (Next.js 16 기본값)
    // -------------------------------------------------------------------------
    // Next.js 16부터 Turbopack이 기본 번들러입니다.
    // 빈 설정을 명시하면 webpack 설정과의 충돌 경고가 사라집니다.
    turbopack: {},

    // -------------------------------------------------------------------------
    // Webpack 설정
    // -------------------------------------------------------------------------
    // Wagmi, Viem 등 Web3 라이브러리를 위한 폴백 설정입니다.
    // Turbopack(--turbo) 사용 시 이 설정은 자동으로 무시됩니다.
    webpack: (config, { dev, isServer }) => {
        // 1. Externals 설정
        // 서버 사이드 전용 패키지(pino-pretty, lokijs 등)가 클라이언트 번들에 포함되지 않도록 제외합니다.
        config.externals.push("pino-pretty", "lokijs", "encoding");

        // 2. Resolve Fallback 설정
        // 브라우저 환경에서 Node.js 모듈(fs, net 등) 사용 시 오류 방지
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            "@react-native-async-storage/async-storage": false,
            "react-native": false,
        };

        // 3. 개발 환경 최적화 (선택 사항)
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

    // -------------------------------------------------------------------------
    // 이미지 최적화 및 보안 설정
    // -------------------------------------------------------------------------
    images: {
        // 외부 이미지 허용 패턴
        // NFT 메타데이터 등 다양한 소스의 이미지를 표시하기 위해 모든 HTTPS 도메인을 허용합니다.
        // 보안상 특정 도메인만 허용하는 것이 좋으나, User Generated Content 특성상 유연하게 설정함.
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
            },
        ],
        // SVG 이미지를 허용 (보안 위험이 있을 수 있으나 아이콘 표시 등을 위해 필요)
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        // 이미지 요청에 대한 CSP 설정
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
    },

    // -------------------------------------------------------------------------
    // 리다이렉트 설정
    // -------------------------------------------------------------------------
    async redirects() {
        return [];
    },

    // -------------------------------------------------------------------------
    // 개발 환경 허용 오리진
    // -------------------------------------------------------------------------
    // ngrok 등 터널링 도구나 프리뷰 배포 URL에서의 접속을 허용합니다.
    allowedDevOrigins: [
        "*.ngrok-free.app",
        "*.vercel.app",
        "basecard.loca.lt",
        "*.basecard.org",
        "localhost",
    ],

    // -------------------------------------------------------------------------
    // HTTP 헤더 보안 설정 (CORS, Embedding)
    // -------------------------------------------------------------------------
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        // Farcaster 등 외부 앱에서 이 페이지를 iframe으로 임베드할 수 있도록 허용
                        key: "Content-Security-Policy",
                        value: "frame-ancestors *",
                    },
                    {
                        // 모든 오리진에서의 API 요청 허용 (CORS)
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                    // 주의: X-Frame-Options: SAMEORIGIN은 제거했습니다.
                    // 이 헤더가 있으면 iframe 임베딩(frame-ancestors)과 충돌하여 차단될 수 있습니다.
                ],
            },
        ];
    },
};

export default nextConfig;
