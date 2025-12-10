# -----------------------------------------------------------------------------
# Stage 1: Dependencies (deps)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# Modified: Added python3, make, g++ for native module compilation (utf-8-validate)
RUN apk add --no-cache libc6-compat python3 make g++

# 패키지 매니저로 bun을 사용하시므로 유지합니다.
COPY package.json bun.lock* ./
RUN npm install -g bun && \
    rm -rf /root/.bun/install/cache && \
    bun install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Builder (builder)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# [Best Practice] Public Variables for Client-Side (Build Time Injection)
# 이 변수들은 브라우저 JS 파일에 "하드코딩" 됩니다.
# 보안상 민감한 정보(Secret)는 절대 NEXT_PUBLIC_을 붙이지 마세요.
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_PROJECT_NAME
ARG NEXT_PUBLIC_ONCHAINKIT_API_KEY
# 주의: CDP_CLIENT_API_KEY가 공개 키라면 유지, 비밀 키라면 제거해야 합니다.
ARG NEXT_PUBLIC_CDP_CLIENT_API_KEY 

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Bun 설치 (Builder 이미지에는 없으므로)
RUN npm install -g bun && bun run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (runner)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# [Best Practice] Copy optimized standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# [Best Practice] Server-Side Secrets (Run Time Injection)
# 빌드 시점이 아닌, 컨테이너 실행 시점에 주입받을 변수들은 여기서 선언할 필요 없이
# docker run -e SECRET_KEY=value ... 로 넘기면 됩니다.
# Next.js Server Side Logic (API Routes, Server Actions)에서 process.env.SECRET_KEY로 접근 가능합니다.

CMD ["node", "server.js"]
