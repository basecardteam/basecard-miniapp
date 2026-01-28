# CLAUDE.md

> **Workspace Navigation:** See `../CLAUDE.md` for full workspace overview (backend, miniapp, ai-agent)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

**Development:**
```bash
bun install                    # Install dependencies
bun run dev                   # Run dev server on localhost:3000
bun run dev:dev              # Run with dev environment (.env.dev)
bun run dev:prod             # Run with prod environment (.env.prod.local)
bun run lint                 # Run ESLint
```

**Build & Deployment:**
```bash
bun run build                # Build for production
bun run start                # Start production server
bun run run-docker-local     # Run with Docker locally
bun run deploy:remote        # Deploy to remote server
```

**Environment Variables:**
- `.env` - Production defaults
- `.env.dev` - Development environment (Base Sepolia testnet, api-dev.basecard.org)
- `.env.prod` - Production environment (Base mainnet, api.basecard.org)
- `.env.prod.local` - Local production config (use for testing prod settings)

Use `bun run dev:dev` or `bun run dev:prod` to run with specific environments.

**Code Quality:**
- 4-space indentation (enforced)
- Max line length: 150 characters
- Unused imports/vars generate errors
- Use underscore prefix (`_var`) to intentionally ignore variables
- `@typescript-eslint/no-explicit-any` generates warnings (acceptable in limited cases)

## Tech Stack

**Core Framework:**
- Next.js 16 (App Router with Turbopack bundler)
- React 19, TypeScript 5
- Bun as package manager

**Blockchain & Web3:**
- Wagmi 2 (wallet connector framework)
- Viem 2 (Ethereum JS library)
- Farcaster MiniApp SDK + Quick Auth
- SIWE (Sign In With Ethereum) for wallet auth
- Base chain (L2, supports Mainnet & Sepolia testnet)

**State Management:**
- Jotai (atomic state for simple global state)
- React Query (TanStack) for server state caching

**UI & Styling:**
- Tailwind CSS + PostCSS
- shadcn-ui components
- Lucide React icons
- Class Variance Authority for component variants

**Forms & Validation:**
- React Hook Form for form state
- Zod for schema validation

## Architecture Overview

This is a **Farcaster MiniApp + Web3 dApp hybrid** serving both as:
1. A Farcaster MiniApp (embedded in Farcaster)
2. A standalone web application (accessible via browser)

### Directory Structure

```
app/                     # Next.js App Router pages & API routes
├── (main)/             # Grouped layout for main features
│   ├── basecard/       # View & manage user's card
│   ├── collection/     # Collect/discover other cards
│   ├── earn/           # Points & rewards dashboard
│   ├── quest/          # Quests system
│   └── page.tsx        # Home/discovery
├── edit-profile/       # OAuth social linking & profile editing
├── mint/               # Card creation flow
├── share/[id]/         # Public share page (SEO/OG)
├── api/auth/           # OAuth endpoints (GitHub, Twitter, LinkedIn)
└── api/health/         # Health check

components/            # Reusable UI components
├── providers/         # Context providers
├── modals/           # Modal dialogs
├── layouts/          # Layout wrappers
└── ui/               # Base UI components

features/             # Feature-specific business logic
├── home/            # Home screen logic
├── basecard/        # Card viewing logic
├── mint/            # Card minting logic
├── edit-profile/    # Profile editing logic
├── collection/      # Collection logic
├── quest/           # Quest system logic
└── earn/            # Earnings logic

hooks/               # Custom React hooks
├── api/            # Data fetching hooks
└── evm/            # Blockchain interaction hooks

lib/                # Utilities & shared services
├── api/           # Backend API clients
├── types/         # TypeScript interfaces
├── constants/     # App constants
├── common/        # Config, logger, utilities
├── abi/          # Smart contract ABIs
├── schemas/      # Zod validation schemas
├── farcaster/    # Farcaster integrations
└── quest/        # Quest utilities
```

### Key Architecture Patterns

**Providers (app/providers.tsx):**
Multiple layered providers setup cross-cutting concerns:
- `FrameProvider` - Detects Farcaster MiniApp context
- `WagmiProvider` - Blockchain wallet connections (MetaMask, Farcaster MiniApp connector, etc.)
- `AuthProvider` - JWT auth state, auto-refresh, token management
- `QueryClientProvider` - React Query caching layer
- Modal providers, notification providers

**Authentication Flow:**
1. **Farcaster MiniApp:** Uses Farcaster Quick Auth token (auto-detected)
   - Backend: POST `/v1/auth/login/farcaster` with Quick Auth JWT
   - Returns: Access token + user object
   - Token expires in 1 hour, auto-refreshes 5 min before expiry

2. **Web Browser:** Wallet signature authentication (SIWE-style)
   - Backend: POST `/v1/auth/login/wallet` with signed message
   - Returns: Access token + user object

3. **OAuth (GitHub, Twitter, LinkedIn):**
   - Frontend: GET `/v1/oauth/{provider}/init` to get auth URL
   - User logs into provider
   - Frontend: GET `/v1/oauth/{provider}/status` to check completion
   - Backend: POST `/v1/auth/{provider}/token` to finalize

**Data Fetching Pattern:**
- Custom hooks in `hooks/api/` wrap React Query
- Examples: `useUser()`, `useMyQuests()`, `useBaseCards()`
- All queries cache and auto-refetch on window focus
- Use query invalidation to refresh after mutations

**Form Handling:**
- React Hook Form + Zod validation
- Feature-specific forms in feature folders
- Schema-driven validation with error messages

### Important Integration Points

**Backend API:**
All API calls go to `NEXT_PUBLIC_BACKEND_API_URL` (default: `https://api.basecard.org`)

Key endpoints:
- `POST /v1/auth/login/{farcaster|wallet}` - Authentication
- `POST /v1/basecards/mint` - Create NFT card
- `GET /v1/quests/active` - Fetch active quests
- `POST /v1/quests/{id}/verify` - Verify quest completion
- `POST /v1/quests/{id}/claim` - Claim reward
- `GET /v1/oauth/{provider}/init` - Start OAuth flow
- `POST /v1/collections/{id}` - Add card to collection

**Blockchain Integration:**
- Network: Base (mainnet: `https://mainnet.base.org`, testnet: Sepolia)
- Contract: BaseCard NFT (ABI in `lib/abi/BaseCard.json`)
- Write operations: Mint card, transfer, approve, delegate
- Read operations: Get card metadata, ownership checks
- Configured RPC endpoints in Wagmi setup

**Auth Token Management:**
Tokens stored in localStorage:
- `basecard_auth_token` - JWT access token
- `basecard_auth_expires` - Unix timestamp expiry
- `basecard_auth_user` - Cached user object

Token auto-refreshes when within 5 minutes of expiry. Logout triggered if wallet address changes.

### Environment-Specific Configuration

**Development (.env.dev):**
- Backend: `https://api-dev.basecard.org`
- Frontend: `https://miniapp-dev.basecard.org`
- Network: Base Sepolia (testnet)
- Indexing disabled (noindex: true in MiniApp metadata)

**Production (.env):**
- Backend: `https://api.basecard.org`
- Frontend: `https://miniapp.basecard.org`
- Network: Base mainnet
- Indexing enabled
- Account association keys set for Farcaster

## Common Development Tasks

**Add a new feature:**
1. Create feature folder: `features/my-feature/`
2. Add page in `app/(main)/my-feature/` or `app/my-feature/`
3. Create custom hooks in `hooks/api/` for data fetching
4. Use existing provider context for auth/blockchain state
5. Reuse components from `components/`

**Interact with blockchain:**
- Use Wagmi hooks: `useAccount()`, `useContractWrite()`, `useContractRead()`
- Contract ABIs in `lib/abi/`
- Transaction state handling with loading/error/success modals
- Check network before operations (Base only)

**Fetch server data:**
- Create hook in `hooks/api/useMyFeature.ts`
- Use `useQuery()` from React Query
- Call API client from `lib/api/`
- Return loading/error/data state

**Handle OAuth:**
- Use existing OAuth endpoints: `GET /v1/oauth/{provider}/init` and `GET /v1/oauth/{provider}/status`
- Store verified socials in user profile
- Show "unverified" modal prompt if social linking incomplete

**Add form validation:**
- Define Zod schema in `lib/schemas/`
- Use with `useForm()` from React Hook Form
- Map schema fields to form inputs
- Display validation errors inline

## Common Gotchas & Important Details

**Next.js 16 Turbopack:**
- Turbopack is the default bundler (faster builds)
- Webpack config still exists but is ignored when using `--turbo`
- Web3 libraries need resolve.fallback config (already set in next.config.ts)

**React 19 Compatibility:**
- Component props must be properly typed
- Some older packages may have compatibility issues
- Key prop is required for lists

**Environment Variables:**
- All public vars must be prefixed with `NEXT_PUBLIC_`
- Private vars (not prefixed) only work on server/API routes
- Change .env file and restart dev server for changes to take effect

**Farcaster MiniApp Context:**
- Only available when app embedded in Farcaster
- Detected via `useMiniKitContext()` hook
- Different auth flow when inside MiniApp (Quick Auth)
- Triggers notification prompt after first login

**Wallet Address Mismatch:**
- AuthProvider logs user out if wallet address changes
- User must re-authenticate with new wallet
- Prevents security issues with wallet switching

**Token Expiry:**
- Tokens expire in 1 hour
- Auto-refresh happens 5 minutes before expiry
- Failed refresh triggers retry modal with countdown
- Manual refresh happens on window focus

**Image Optimization:**
- All external images allowed (remotePatterns: `https://**`)
- IPFS gateway configured in .env (`NEXT_PUBLIC_IPFS_GATEWAY_URL`)
- SVG images allowed (CSP: sandbox enabled)
- Use `next/image` component for optimization

**CORS & Embedding:**
- CSP header: `frame-ancestors *` (allows iframe embedding)
- CORS: `Access-Control-Allow-Origin: *`
- Intentional: App designed to be embeddable in other platforms

## Type Safety & Best Practices

- TypeScript strict mode enabled
- All API responses should be typed in `lib/types/`
- Use Zod schemas for runtime validation of external data
- Prefer explicit types over `any` (generates warnings)
- Use Jotai atoms for simple global state (avoid prop drilling)
- Keep components small and focused
- Extract complex logic into custom hooks
