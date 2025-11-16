# 🚀 BaseCard Builder Mini App Quickstart (README)

---

## 1\. 프로젝트 개요

| 구분           | 내용                                                         |
| :------------- | :----------------------------------------------------------- |
| **목표**       | Farcaster/Base 사용자가 자신의 프로필을 NFT(BaseCard)로 민팅 |
| **프론트엔드** | Next.js (App Router), React, Tailwind CSS                    |
| **상태 관리**  | Jotai (전역 상태)                                            |
| **Web3 연동**  | Coinbase OnchainKit (미니앱 환경 및 인증)                    |

---

## 2\. 필수 준비 사항 (Prerequisites)

팀원들이 공통 환경에서 개발을 시작하기 위한 준비물입니다.

| 도구/계정                         | 설명                                                |
| :-------------------------------- | :-------------------------------------------------- |
| **Node.js**                       | v18+                                                |
| **NPM**                           | 패키지 관리자                                       |
| **Git**                           | 버전 관리 시스템                                    |
| **CDP API Key**                   | Coinbase Developer Platform에서 발급받은 **API 키** |
| **ERC20 Token Contract Address**  | 사용할 ERC20 컨트랙트주소                           |
| **ERC721 Token Contract Address** | 사용할 ERC721 컨트랙트주소                          |
| **Git 계정**                      | 코드 커밋 및 푸시를 위해 필요합니다.                |

---

## 3\. 개발 환경 설정 (Getting Started)

### 3.1. 레포지토리 클론 및 설치

```bash
# 1. 레포지토리 클론
git clone https://github.com/4uphwang/base-batch-mini-app.git
cd base-batch-mini-app.git
```

# 2. 의존성 설치

```
npm install
```

or

```
yarn install
```

### 3.2. 환경 변수 설정 (필수)

팀원들은 `.env.local.example`을 참고하여 **`.env.local`** 파일을 생성하고, 팀 리더로부터 전달받은 **공통 키**와 **로컬 환경 설정**을 채워 넣어야 합니다.

```bash
# .env.local

# 1. 공통 설정
NEXT_PUBLIC_PROJECT_NAME=BaseCard
NEXT_PUBLIC_ONCHAINKIT_API_KEY="[팀 공동 CDP API 키 입력]"
NEXT_PUBLIC_URL="http://localhost:3000"

# 2. 컨트랙트 주소 (토큰 민팅 및 조회용)
NEXT_PUBLIC_BASECARD_NFT_CONTRACT_ADDRESS="[배포된 NFT 컨트랙트 주소]"
NEXT_PUBLIC_CARD_TOKEN_ADDRESS="[배포된 ERC20 토큰 컨트랙트 주소]"

# 3. 네트워크 설정
# true = Base Sepolia (testnet), false = Base Mainnet (production)
# 개발 중에는 true로 설정 (기본값: NODE_ENV가 development면 자동으로 testnet 사용)
NEXT_PUBLIC_USE_TESTNET=true

# 4. 목업 모드 설정 (선택사항)
# Base 앱에서 디버깅이 느릴 때 목업 데이터를 사용하여 빠르게 개발할 수 있습니다.
# true로 설정하면 Base 앱 연결 없이도 로컬에서 개발 가능합니다.
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3.3. 로컬에서 실행

```bash
# Base Sepolia (testnet)로 개발 (기본값)
npm run dev

# Base Sepolia (testnet)로 명시적 실행
npm run dev:testnet

# Base Mainnet으로 테스트
npm run dev:mainnet
```

or

```bash
yarn dev
yarn dev:testnet
yarn dev:mainnet
```

#### 네트워크 자동 전환 기능

앱에 접속하면 자동으로 올바른 네트워크를 확인하고, 잘못된 네트워크일 경우 전환을 요청하는 모달이 표시됩니다:

-   **Development 모드**: Base Sepolia (chainId: 84532) 필수
-   **Production 모드**: Base Mainnet (chainId: 8453) 필수

`.env.local`에서 `NEXT_PUBLIC_USE_TESTNET` 값을 변경하여 네트워크를 전환할 수 있습니다

---

## 4\. 협업 및 버전 관리 전략

4.1. 개발 시작 워크플로우
아래의 세 단계만 반복하며 개발을 진행합니다.

새 브랜치 생성 및 작업 시작: 새로운 기능 개발이나 버그 수정 시 반드시 새 브랜치를 생성합니다.

```Bash
git checkout main
git pull
git checkout -b feature/mint-form-design
```

자유로운 커밋 및 푸시 (테스트 요청): 개발 중 변경사항이 발생하면 자유롭게 커밋하고 원격 저장소에 푸시합니다. 이 푸시가 테스트용 프리뷰 URL을 생성해 달라는 요청이 됩니다.

```Bash

git commit -m "feat: [기능 요약] 구현 완료"
git push origin feature/mint-form-design
```

이 푸시를 감지하여 Vercel에서 프리뷰 URL을 생성하고 테스트를 진행하며 URL을 공유합니다.
새로 생성한 브랜치에 계속 작업하면서 푸시하면 자동 배포 되며 프리뷰 URL은 유지 됩니다.

### 4.3. Manifest 및 배포 주소

Farcaster Manifest 서명(`accountAssociation`)과 최종 배포 URL(`NEXT_PUBLIC_URL`) 관리는 **제 Vercel 계정**을 통해 일괄 관리됩니다. 팀원들은 이 과정에 관여할 필요가 없으며, `minikit.config.ts` 파일의 최신 버전을 유지하기만 하면 됩니다.

---

## 5\. Next.js 개발 팁

-   **API Route:** 백엔드 로직은 `app/api/` 폴더 내에 `route.ts` 파일로 구현됩니다.
-   **ABI 파일:** 컨트랙트 ABI 파일은 `lib/abi/` 폴더에 저장되어 있으며, 이 파일을 통해 컨트랙트 함수를 호출합니다.
-   **전역 상태:** NFT 소유 여부, 잔액 등 전역 데이터는 `store/` 폴더의 Jotai 아톰을 통해 관리됩니다.
-   **공유 타입:** 프론트엔드와 백엔드에서 공유하는 타입은 `lib/types/` 폴더에 정의되어 있습니다.

### 공유 타입 사용 예시

```typescript
// ✅ Good - 중앙 집중식 타입 import
import { CardGenerationResponse, CardGenerationData } from "@/lib/types";

// 프론트엔드 (Hook)
export function useCardGeneration() {
    const [result, setResult] = useState<CardGenerationResponse | null>(null);
    // ...
}

// 백엔드 (API Route)
export async function POST(request: Request) {
    const response: CardGenerationResponse = {
        success: true,
        svg: svgContent,
        ipfs: { cid, url },
    };
    return NextResponse.json(response);
}
```

### ⚠️ 보안 주의사항

#### Server-Side Only 파일

다음 파일들은 **반드시 서버 사이드에서만** 사용해야 합니다:

-   `lib/ipfs.ts` - Pinata JWT 포함 (API Route에서만 사용)
-   `lib/db.ts` - Database 연결 정보 포함

```typescript
// ❌ Bad - Client Component에서 직접 import
"use client";
import { uploadBaseCardToIPFS } from "@/lib/ipfs"; // 🚨 보안 위험!

// ✅ Good - API Route를 통해 간접 호출
("use client");
export function MyComponent() {
    const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
    });
}
```

#### 환경 변수 규칙

-   `NEXT_PUBLIC_*` - 클라이언트에서 접근 가능 (공개 정보만)
-   그 외 - 서버 사이드에서만 접근 가능 (민감 정보)

```bash
# ✅ 클라이언트에 노출 가능
NEXT_PUBLIC_BASECARD_NFT_CONTRACT_ADDRESS=0x...

# ❌ 서버 사이드 전용 (절대 NEXT_PUBLIC_ 붙이지 말 것!)
PINATA_JWT=eyJ...
DATABASE_URL=postgresql://...
```
