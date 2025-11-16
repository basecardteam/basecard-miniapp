# Webpack 설정 분석 및 터보팩 적용

## 📋 코드 분석 (26-34줄)

### 1. `config.externals.push("pino-pretty", "lokijs", "encoding")`

**목적:**
- 서버 사이드 전용 패키지를 클라이언트 번들에서 제외
- 번들 크기 감소 및 브라우저 호환성 문제 방지

**패키지 설명:**
- `pino-pretty`: 로깅 라이브러리 포맷터 (서버 전용)
- `lokijs`: 인메모리 데이터베이스 (서버 전용)
- `encoding`: Node.js 인코딩 유틸리티 (서버 전용)

**사용 여부:**
- ❌ 직접 import 없음
- ⚠️ `wagmi`, `viem`, `onchainkit` 등의 Web3 라이브러리의 **간접 의존성**일 수 있음
- ⚠️ 빌드 오류 방지를 위해 필요할 수 있음

---

### 2. `config.resolve.fallback`

**목적:**
- React Native 모듈이 웹 환경에서 import될 때 오류 방지
- Node.js 전용 모듈을 브라우저에서 사용할 때 폴백 처리

**설정 설명:**
- `@react-native-async-storage/async-storage`: false → 모듈 로드 실패 처리
- `react-native`: false → 모듈 로드 실패 처리

**사용 여부:**
- `@react-native-async-storage/async-storage`: devDependencies에만 있고 실제 사용 안 함
- `react-native`: 직접 사용 안 함
- ⚠️ MetaMask SDK나 다른 Web3 라이브러리가 간접적으로 포함시킬 수 있음

---

## 🎯 결론 및 권장 사항

### 필요성 평가

1. **`pino-pretty`, `lokijs`, `encoding` (externals)**
   - ✅ **필요**: Web3 라이브러리의 간접 의존성일 가능성 높음
   - 빌드 오류 방지를 위해 유지 권장

2. **React Native fallback**
   - ⚠️ **조건부 필요**: MetaMask SDK 등이 포함시키면 필요
   - 실제 빌드 오류가 발생하면 유지

### 터보팩 사용 시

터보팩은 webpack 설정을 무시하므로, 필요 시:
1. Turbo 설정으로 처리 (아직 완전 지원 안 됨)
2. 또는 webpack 모드로 폴백

---

## 🚀 터보팩 적용 권장

터보팩을 사용하면 이 webpack 설정은 무시되지만, 실제 빌드에서 문제가 발생할 수 있습니다.

**옵션 1: 터보팩 사용 (권장)**
- webpack 설정 제거
- 빌드 오류 발생 시 필요한 부분만 추가

**옵션 2: 조건부 유지**
- 터보팩 사용 시 webpack 설정 제거
- 일반 모드에서만 webpack 설정 적용

