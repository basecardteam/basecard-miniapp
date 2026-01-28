# BaseCard Miniapp Specification

This document provides a comprehensive overview of the BaseCard Miniapp, designed to help developers and AI agents understand the system architecture, service goals, and code organization.

## 1. Service Description

**BaseCard** is a "Professional Identity Layer on Base." It allows builders and users on the Base network to mint a verified, onchain ID card that aggregates their reputation, social proofs, and achievements.

### Core Value Proposition

- **Unified Identity**: Aggregates Farcaster, Twitter, GitHub, and Website links into a single onchain asset.
- **Reputation**: showcase "Quests" completed and "Points" earned.
- **Discovery**: Helps users find others with shared interests or specific roles (e.g., Developer, Creator).
- **Hybrid Platform**: Works seamlessly as both a Farcaster MiniApp (embedded) and a standalone web application.

### Key Features

- **Minting**: Users create a BaseCard NFT with their profile data.
- **Quests & Earn**: Users complete tasks (onchain or offchain) to earn points and badges.
- **Collection**: Users can "collect" other people's cards to build a network.
- **Social Graph**: heavily integrated with Farcaster for social graph bootstrapping.

## 2. System Design

### Architecture Overview

The application follows a modern **Hybrid Web3** architecture.

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Jotai (Client Global), React Query (Server State)
- **Web3 Layer**:
    - **Wagmi/Viem**: For wallet connection and contract interaction.
    - **Farcaster Kit**: For Farcaster-specific auth and Frame interactions.
- **Backend Interaction**:
    - Custom API client interacting with a Supabase/Postgres backend.
    - Authentication via JWT (Farcaster Quick Auth or SIWE).

### Data Flow

1.  **Auth**: User logs in via Farcaster Frame context OR Wallet Connect (SIWE).
2.  **Session**: A session token (JWT) is issued and stored.
3.  **Data Fetching**: Custom hooks (e.g., `useUser`, `useMyQuests`) fetch data from the API.
4.  **Transactions**: User initiates an action (Mint, Verify); Wagmi prompts the wallet/Miniapp to sign.

## 3. Directory Specification

This section details the purpose of each key directory to minimize token consumption during context loading.

### `app/` (Next.js App Router)

Entry points and routing logic.

- `(main)/`: Main application layout (authenticated context).
    - `home/`: Dashboard/Landing.
    - `basecard/`: Card viewing and management.
    - `earn/`, `quest/`, `collection/`: Feature-specific pages.
- `api/`: Next.js API Routes (primarily for OAuth callbacks and health checks, _not_ main business logic).
- `providers.tsx`: Global context providers (Wagmi, Auth, Frame).
- `layout.tsx`: Root layout including fonts and metadata.

### `features/` (Business Logic)

Contains the core functional logic, decoupled from the routing layer.

- `basecard/`: Components and logic for displaying/editing cards.
- `mint/`: Complex multi-step flow for minting a new card.
- `quest/`: Logic for displaying quests and handling verification actions.
- `collection/`: Logic for the card collection system.
- `home/`: Components specific to the dashboard/landing page.

### `lib/` (Utilities & Core Services)

Shared code used across features and pages.

- `api/`: **Core API Client**. Contains the definitions for all backend endpoints.
- `types/`: **Source of Truth for Data Models**. `api.ts` defines all Interfaces (User, BaseCard, Quest).
- `abis/`: Smart contract ABIs (e.g., `BaseCard.json`).
- `hooks/`: Generic hooks not tied to a specific feature (though some feature hooks live in `features/`).
- `constants/`: Configuration values, contract addresses.

### `components/` (UI Library)

Reusable visual components.

- `ui/`: Atomic components (Buttons, Inputs) - mostly Shadcn.
- `modals/`: Global modal system.
- `providers/`: Individual provider implementations.

## 4. Key Configuration Files

- `minikit.config.ts`: **Critical**. Defines the Farcaster MiniApp metadata (icon, title, webhook).
- `next.config.ts`: Next.js configuration (headers, images).
- `package.json`: Dependency map (check `dependencies` vs `devDependencies`).
- `CLAUDE.md`: Operational guide for running/deploying the project.

## 5. Development Guidelines for AI

- **Do not import from `dist/` or `build/` files.**
- **Prefer `features/`** when looking for business logic.
- **Check `lib/types/api.ts`** first to understand data structures.
- **Use `minikit.config.ts`** to understand how the app appears inside Farcaster.
