# Next.js 개발 환경 성능 최적화

## 🚀 적용된 최적화 사항

### 1. **Turbo 모드 활성화** ✅
Next.js 15의 Turbo 모드를 개발 환경에서 활성화하여 빌드 및 HMR 속도를 개선했습니다.

**변경 사항:**
- `next.config.ts`에 Turbo 모드 설정 추가
- 개발 모드에서 빠른 컴파일과 HMR

**예상 효과:**
- 개발 서버 시작 시간: 30-50% 단축
- HMR (Hot Module Replacement): 40-60% 향상

---

### 2. **Webpack 최적화** ✅
개발 환경에서 불필요한 최적화를 제거하여 빌드 속도 향상.

**변경 사항:**
```typescript
if (dev && !isServer) {
  config.optimization = {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  };
}
```

**효과:**
- 개발 모드 빌드 시간 감소
- 페이지 전환 속도 개선

---

### 3. **useMemo 의존성 배열 수정** ✅
`app/(main)/layout.tsx`의 useMemo 의존성 배열에 누락된 `ROOT_URL` 추가.

**효과:**
- 불필요한 리렌더링 감소

---

## 🎯 추가 최적화 권장 사항

### 1. **동적 Import 사용**
큰 컴포넌트는 동적 import로 로딩 지연:

```typescript
// 예시
const CardGeneratorDemo = dynamic(() => import("./CardGeneratorDemo"), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // 클라이언트 전용 컴포넌트
});
```

**대상 컴포넌트:**
- `CardGeneratorDemo` - 큰 컴포넌트
- `CardCollectionAdder` - 조건부 렌더링
- `NetworkChecker` - 초기 로딩 시에만 필요

---

### 2. **이미지 최적화 강화**
Next.js Image 컴포넌트 최적화 옵션 추가:

```typescript
<Image
  src={imageSrc}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
  priority={false} // 필요한 경우만 true
  placeholder="blur"
/>
```

---

### 3. **React.memo 활용 확대**
불필요한 리렌더링을 방지하기 위해 React.memo 사용 확대:

```typescript
// 이미 적용된 예시: CardItem
const CardItem = React.memo(function CardItem({ ... }) {
  // ...
});
```

**추가 적용 권장:**
- `MyCardSection`
- `CollectCardsSection`
- `Header`, `FooterNav`

---

### 4. **개발 서버 옵션 최적화**
`package.json` 스크립트 개선:

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:fast": "NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo"
  }
}
```

---

### 5. **불필요한 Provider 제거**
개발 환경에서만 필요한 Provider는 조건부 로드:

```typescript
// ErudaProvider는 이미 조건부 로드됨 ✅
{isDevelopment && <ErudaProvider />}
```

---

## 📊 성능 측정

개발 환경 성능을 측정하려면:

1. **React DevTools Profiler** 사용
2. **Next.js Analytics** 활성화
3. **Chrome DevTools Performance** 탭 사용

---

## 🔍 문제 진단 체크리스트

페이지 전환이 여전히 느린 경우:

- [ ] 브라우저 확장 프로그램 비활성화 (특히 React DevTools)
- [ ] 개발자 도구 닫고 테스트
- [ ] 네트워크 탭에서 큰 파일 다운로드 확인
- [ ] 콘솔에서 경고/에러 확인
- [ ] 메모리 사용량 확인 (메모리 누수 가능성)

---

## 💡 개발 팁

1. **프로덕션 빌드로 테스트**: `npm run build && npm start`
   - 개발 모드와 프로덕션 모드 성능 차이 확인

2. **코드 스플리팅 확인**: 
   - `npm run build` 후 번들 크기 확인
   - 큰 청크가 있는지 확인

3. **의존성 최적화**:
   - 불필요한 패키지 제거
   - 큰 라이브러리는 동적 import 고려

---

## 📚 참고 문서

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Next.js Turbo Mode](https://nextjs.org/docs/app/api-reference/next-config-js/turbo)
- [React Performance](https://react.dev/learn/render-and-commit)

