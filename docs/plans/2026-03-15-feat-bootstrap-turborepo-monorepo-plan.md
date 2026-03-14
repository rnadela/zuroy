---
title: Bootstrap Turborepo Monorepo
type: feat
date: 2026-03-15
---

# Bootstrap Turborepo Monorepo

## Enhancement Summary

**Deepened on:** 2026-03-15
**Agents used:** architecture-strategist, security-sentinel, performance-oracle, data-integrity-guardian, code-simplicity-reviewer, pattern-recognition-specialist, best-practices-researcher, framework-docs-researcher, repo-research-analyst, learnings-researcher

### Key Improvements

1. **Simplified scope** — 9 models → 4 for initial schema. Defer `@zuroy/ui`, Redis, and advanced auth until features need them.
2. **Fixed critical schema issues** — added missing FK relations on ServiceRequest, proper cascade behavior, database indexes, Decimal precision.
3. **Separated device auth from User model** — devices get their own auth flow, not a Role enum hack.
4. **Added tenant isolation** — Prisma middleware to auto-scope queries by `hotelId`. Added `hotelId` directly to Reservation.
5. **Upgraded tooling** — turbo.json v2 `tasks` key, custom Prisma output path, MUI v6 `enableCssLayer`, NestJS v11 (SWC + Vitest defaults), Expo SDK 54.
6. **Security hardening** — provisioning token expiry + entropy, JWT secret validation at startup, rate limiting, env validation with Zod.
7. **API versioning** — `/v1/` prefix from day 1 (mobile app has separate release cycle).

### Simplification Applied

Per simplicity review, ~40% of original Phase 1 scope deferred. Only build what's needed to start the first feature.

---

## Overview

Scaffold the entire Zuroy monorepo from scratch — root config, shared packages, all 4 apps, Docker Compose, and dev tooling — so that `yarn dev` starts everything and feature development can begin.

## Decisions Made

| Decision        | Choice                                           | Rationale                                                                                 |
| --------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Validation      | Zod                                              | Schema-first, works on all platforms. Custom `ZodValidationPipe` for NestJS.              |
| Package build   | Raw TypeScript                                   | No build step. `transpilePackages` in Next.js, Metro auto-resolves in Expo SDK 54.        |
| apps/grow       | Omit                                             | Phase 3. Scaffold when needed.                                                            |
| Coverage gate   | Defer                                            | Set up Vitest configs now. Enable 100% gate after first feature lands.                    |
| Package scope   | `@zuroy/*`                                       | `@zuroy/shared`, `@zuroy/database`. Defer `@zuroy/ui` until real shared components exist. |
| Yarn            | v1 classic                                       | Safest for Prisma + NestJS + Expo combo. Document as intentional tech debt.               |
| ESLint          | Legacy `.eslintrc`                               | Better ecosystem compatibility.                                                           |
| Ports           | API: 3001, Portal: 3000, Connect: 3002, Go: 8081 | No conflicts.                                                                             |
| DB names        | `zuroy_dev`, `zuroy_test`                        | Convention.                                                                               |
| Expo            | Dev Client (SDK 54)                              | NFC requires native modules. SDK 54 auto-configures Metro for monorepos.                  |
| MUI + Tailwind  | CSS Layers (`enableCssLayer`)                    | MUI v6 approach. `@layer` ordering instead of disabling preflight.                        |
| NestJS          | v11                                              | SWC default compiler, Vitest default test runner. Aligns with stack.                      |
| Prisma          | v6                                               | Stable. v7 is ESM-only + driver adapters — defer migration.                               |
| API versioning  | `/v1/` prefix                                    | Mobile app has separate release cycle. Retrofit is painful.                               |
| Device auth     | Separate from User                               | Devices auth via serial + enrollment code, not User table.                                |
| `@zuroy/ui`     | Defer                                            | No shared components exist yet. Extract when 2+ apps share a real component.              |
| Redis in Docker | Defer                                            | Not needed until JWT blacklist or BullMQ features are built.                              |

## Implementation Phases

### Phase 1: Monorepo Shell

Root-level config files. Everything else depends on this.

**Files to create:**

- `package.json` — Yarn workspaces (with `nohoist` for react-native), scripts, engines (Node 20+)
- `turbo.json` — v2 format with `tasks` key (not `pipeline`)
- `tsconfig.base.json` — Strict mode, ES2022 target, path aliases for `@zuroy/*`
- `.eslintrc.json` — Base config extending `@typescript-eslint/recommended`
- `.prettierrc` — Single quotes, trailing commas, 100 print width
- `.gitignore` — node_modules, dist, .next, .expo, .env, coverage, prisma generated
- `.env.example` — Only vars needed for day 1
- `.node-version` — `20`
- `docker-compose.yml` — PostgreSQL 16 only (Redis deferred)

**Root `package.json` workspaces with `nohoist`:**

```jsonc
{
  "workspaces": {
    "packages": ["apps/*", "packages/*"],
    "nohoist": ["**/react-native", "**/react-native/**", "**/expo", "**/expo/**"],
  },
}
```

> **Research insight:** Yarn v1 hoists everything by default. Without `nohoist`, Metro resolves the wrong copy of `react-native` from root `node_modules/`, causing "Invalid hook call" errors.

**`turbo.json` (v2 format):**

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "globalEnv": ["DATABASE_URL", "NODE_ENV"],
  "tasks": {
    "db:generate": {
      "cache": false,
    },
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true,
    },
    "lint": {},
    "test": {
      "dependsOn": ["^db:generate"],
    },
  },
}
```

> **Research insight:** `db:generate` must never be cached — Prisma client output depends on binary platform. `DATABASE_URL` in `globalEnv` ensures cache invalidation when DB connection changes.

**`.env.example` (minimal — only what's needed day 1):**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zuroy_dev

# Auth
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=15m

# Apps
API_PORT=3001
PORTAL_PORT=3000
CONNECT_PORT=3002
```

> **Security insight:** Remove `REDIS_URL`, `SENDGRID_API_KEY`, `GOOGLE_MAPS_API_KEY` — add when the integration is built. Extra vars create "do I need this?" confusion for new devs.

**`docker-compose.yml`:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: zuroy_dev
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
    shm_size: 128mb

volumes:
  postgres_data:
```

> **Architecture insight:** Added `healthcheck` (API won't crash connecting before Postgres is ready), `shm_size` (PostgreSQL shared buffers), and memory limit. Redis deferred — not needed until JWT blacklist or BullMQ.

**Success criteria:** `yarn install` completes. `docker compose up -d` starts Postgres. Health check passes.

---

### Phase 2: Shared Packages

Only 2 packages for day 1 (`@zuroy/ui` deferred until real shared components exist).

#### `packages/shared`

Shared types, Zod schemas, constants used by all apps. **Must not import Node.js-only APIs** (Metro bundles for React Native).

**`package.json` with `exports` for live types:**

```jsonc
{
  "name": "@zuroy/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": { "types": "./src/index.ts", "default": "./src/index.ts" },
    "./*": { "types": "./src/*/index.ts", "default": "./src/*/index.ts" },
  },
}
```

> **Research insight:** Both `main` and `types` point to `.ts` source for live types — changes reflected instantly in consuming apps. `exports` subpaths enable `@zuroy/shared/schemas` imports for better tree-shaking (avoids barrel export bloat).

**Files:**

- `packages/shared/src/index.ts` — barrel export
- `packages/shared/src/constants/roles.ts` — re-export Prisma's `Role` enum (single source of truth from `@zuroy/database`)
- `packages/shared/src/schemas/auth.ts` — Zod schemas for login, register
- `packages/shared/src/schemas/env.ts` — Zod schema for env var validation at startup
- `packages/shared/src/types/index.ts` — API request/response DTOs (typed API contract)

> **Pattern insight:** Role enum lives in Prisma schema as the canonical source. `@zuroy/shared` re-exports it. Do NOT define a duplicate enum in constants. Zod schemas should NOT import Prisma types directly — use `z.infer<>` to derive types.

#### `packages/database`

Prisma schema and client re-export. **Only `apps/api` should depend on this directly.** Frontend apps get types via `@zuroy/shared`.

**Files:**

- `packages/database/package.json` — name: `@zuroy/database`, scripts including `postinstall: "prisma generate"`
- `packages/database/prisma/schema.prisma` — initial schema (see below)
- `packages/database/src/index.ts` — re-exports PrismaClient singleton + generated types/enums
- `packages/database/src/client.ts` — singleton PrismaClient instance
- `packages/database/generated/` — custom Prisma client output (not default `node_modules/.prisma`)

**Prisma generator with custom output:**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
}
```

> **Research insight:** Custom output path avoids the #1 Turborepo + Prisma pain point — multiple packages stomping on each other's generated clients in `node_modules/.prisma/client`. The `postinstall` hook ensures client is generated after `yarn install`.

**Initial Prisma schema (simplified — 4 core models):**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Core Models ────────────────────────────────────

model Hotel {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  address        String?
  latitude       Float?   @db.DoublePrecision
  longitude      Float?   @db.DoublePrecision
  logoUrl        String?
  primaryColor   String?
  secondaryColor String?
  backgroundUrl  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  rooms    Room[]
  devices  Device[]
  staff    User[]
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @db.VarChar(60)
  firstName    String
  lastName     String
  role         Role     @default(HOTEL_STAFF)
  hotelId      String?
  hotel        Hotel?   @relation(fields: [hotelId], references: [id], onDelete: Restrict)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([hotelId])
  @@index([role])
}

enum Role {
  SUPER_ADMIN
  HOTEL_STAFF
}

model Room {
  id           String        @id @default(cuid())
  number       String        @db.VarChar(20)
  floor        Int?
  type         String?
  hotelId      String
  hotel        Hotel         @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  reservations Reservation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([hotelId, number])
}

model Device {
  id             String       @id @default(cuid())
  serialNumber   String       @unique
  deviceModel    String?
  status         DeviceStatus @default(UNASSIGNED)
  hotelId        String?
  hotel          Hotel?       @relation(fields: [hotelId], references: [id], onDelete: Restrict)
  enrollmentCode String?      @unique
  lastHeartbeat  DateTime?
  batteryLevel   Int?
  appVersion     String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  reservations Reservation[]

  @@index([hotelId, status])
}

enum DeviceStatus {
  UNASSIGNED
  ASSIGNED
  ONLINE
  OFFLINE
  MAINTENANCE
}

model Reservation {
  id                         String            @id @default(cuid())
  guestName                  String
  guestEmail                 String?
  guestPhone                 String?
  hotelId                    String
  roomId                     String
  room                       Room              @relation(fields: [roomId], references: [id], onDelete: Restrict)
  deviceId                   String?
  device                     Device?           @relation(fields: [deviceId], references: [id], onDelete: SetNull)
  checkIn                    DateTime
  checkOut                   DateTime
  status                     ReservationStatus @default(PENDING)
  provisioningToken          String?           @unique
  provisioningTokenExpiresAt DateTime?
  createdAt                  DateTime          @default(now())
  updatedAt                  DateTime          @updatedAt

  @@index([hotelId])
  @@index([roomId, status, checkIn, checkOut])
  @@index([status])
  @@index([deviceId])
}

enum ReservationStatus {
  PENDING
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  NO_SHOW
}
```

> **Critical fixes applied:**
>
> - **Renamed `password` → `passwordHash`** with `@db.VarChar(60)` — signals intent, prevents accidental logging.
> - **Renamed `model` → `deviceModel`** on Device — `model` shadows Prisma concept.
> - **Added `@relation` with explicit `onDelete`** on all FKs. Hotel→Room cascades. Hotel→User/Device restricts (must reassign first).
> - **Added `hotelId` directly to Reservation** — denormalized for tenant isolation queries without joining through Room.
> - **Added `provisioningTokenExpiresAt`** — tokens must expire (security critical).
> - **Added `enrollmentCode` to Device** — separate device auth flow, not User table.
> - **Added `lastHeartbeat` separate from `updatedAt`** — telemetry writes don't trigger business-logic timestamps.
> - **Added `device` relation on Reservation** — was a dangling `deviceId` string.
> - **Added `@@index`** on all common query patterns.
> - **Used `@db.DoublePrecision`** for lat/lng — standard for geospatial.
> - **Added `NO_SHOW`** to ReservationStatus enum.
> - **Removed `DEVICE` from Role enum** — devices auth separately.
> - **Deferred models**: Amenity, ServiceItem, ServiceRequest, Partner — add when building those features. Prevents premature schema that will be altered.

**ERD (Mermaid):**

```mermaid
erDiagram
    Hotel ||--o{ Room : has
    Hotel ||--o{ Device : has
    Hotel ||--o{ User : employs
    Room ||--o{ Reservation : books
    Device ||--o{ Reservation : serves

    Hotel {
        string id PK
        string name
        string slug UK
        string logoUrl
        string primaryColor
    }
    User {
        string id PK
        string email UK
        string passwordHash
        Role role
        string hotelId FK
    }
    Room {
        string id PK
        string number
        string hotelId FK
    }
    Device {
        string id PK
        string serialNumber UK
        string enrollmentCode UK
        DeviceStatus status
        string hotelId FK
    }
    Reservation {
        string id PK
        string hotelId
        string roomId FK
        string deviceId FK
        string provisioningToken UK
        ReservationStatus status
    }
```

**Success criteria:** `yarn install` resolves all workspace deps. `prisma generate` succeeds. `prisma migrate dev` creates tables.

---

### Phase 3: Apps

#### `apps/api` — NestJS v11 Backend

Scaffold with `nest new api --strict` inside `apps/`. NestJS v11 uses SWC compiler and Vitest by default.

**Core modules (minimal for scaffold):**

- `AppModule` — root module, imports feature modules
- `AuthModule` — JWT strategy, login/register, `JwtAuthGuard` (global)
- `HealthModule` — `GET /v1/health` endpoint using `@nestjs/terminus`
- `PrismaModule` — `@Global()` Prisma service wrapping `@zuroy/database`
- `ConfigModule` — `@nestjs/config` with Zod env validation (fail-fast on missing vars)

> **Simplification:** Deferred from scaffold: `HotelsModule`, `UsersModule`, `RolesGuard`, `ZodValidationPipe`, Redis connection. Add when building the first CRUD feature.

**Key files:**

- `apps/api/src/main.ts` — bootstrap with `/v1` global prefix, CORS whitelist, Helmet
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth.controller.ts` — `POST /v1/auth/login`, `POST /v1/auth/register`
- `apps/api/src/auth/auth.service.ts` — JWT sign/verify, bcrypt hashing, startup secret validation
- `apps/api/src/auth/jwt.strategy.ts` — Passport JWT strategy (secret from ConfigService)
- `apps/api/src/auth/guards/jwt-auth.guard.ts` — global guard with `@Public()` bypass
- `apps/api/src/auth/decorators/public.decorator.ts` — `@Public()` using `SetMetadata`
- `apps/api/src/prisma/prisma.module.ts` — `@Global()` module
- `apps/api/src/prisma/prisma.service.ts` — extends PrismaClient, `onModuleInit`/`onModuleDestroy`
- `apps/api/src/health/health.controller.ts` — `@nestjs/terminus` with custom Prisma indicator
- `apps/api/vitest.config.ts` — `unplugin-swc` for decorator support
- `apps/api/.swcrc` — SWC config with `legacyDecorator` + `decoratorMetadata`
- `apps/api/test/setup.ts` — `import 'reflect-metadata'` (must be first)

> **Security additions:**
>
> - JWT secret validation at startup — reject dev default when `NODE_ENV !== 'development'`
> - `@nestjs/throttler` — 5 login attempts per 15 min per IP
> - `helmet` middleware for security headers
> - CORS whitelist: `localhost:3000`, `localhost:3002` for dev
> - Provisioning tokens: `crypto.randomBytes(32).toString('hex')`, 10-min expiry, single-use

**Vitest config with SWC:**

```typescript
// apps/api/vitest.config.ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
```

> **Research insight:** NestJS decorators require `emitDecoratorMetadata` which esbuild (Vitest default) doesn't support. `unplugin-swc` + `.swcrc` with `legacyDecorator: true` and `decoratorMetadata: true` is the solution. `reflect-metadata` must be imported first in setup file.

**NestJS raw TS package transpilation:**

```jsonc
// apps/api/tsconfig.json — include workspace packages
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "paths": {
      "@zuroy/shared": ["../../packages/shared/src"],
      "@zuroy/shared/*": ["../../packages/shared/src/*"],
      "@zuroy/database": ["../../packages/database/src"],
      "@zuroy/database/*": ["../../packages/database/src/*"],
    },
  },
  "include": ["src/**/*", "../../packages/shared/src/**/*", "../../packages/database/src/**/*"],
}
```

> **Architecture insight:** NestJS uses `tsc` or SWC to compile. Unlike Next.js (`transpilePackages`) and Metro (auto-resolve), NestJS has no built-in monorepo package transpilation. The `include` + `paths` approach resolves this.

#### `apps/portal` — Next.js Admin

Scaffold with `npx create-next-app@latest apps/portal --typescript --tailwind --app --src-dir --eslint`.

**Configure:**

- `next.config.ts` — `transpilePackages: ['@zuroy/shared']` (no `@zuroy/ui` yet)
- MUI + Emotion setup — `AppRouterCacheProvider` with `enableCssLayer: true`
- CSS layer ordering in global CSS: `@layer theme, base, mui, components, utilities;`
- `apps/portal/src/app/layout.tsx` — root layout with ThemeRegistry
- `apps/portal/src/app/page.tsx` — dashboard stub
- `apps/portal/src/app/login/page.tsx` — login page stub
- `apps/portal/vitest.config.ts`

> **Research insight:** MUI v6 `enableCssLayer` wraps all Emotion styles in `@layer mui`. Combined with `@layer` ordering, Tailwind utilities reliably override MUI defaults without `!important` or disabling preflight. This eliminates the classic dev/prod CSS ordering bug (Next.js Discussion #32565).

#### `apps/connect` — Next.js Hotel Staff

Same scaffold as portal. Different branding/layout. Same `transpilePackages` and MUI/Tailwind config.

#### `apps/go` — Expo SDK 54 Guest App

Scaffold with `npx create-expo-app@latest apps/go --template blank-typescript`.

**Configure:**

- `app.json` — `platforms: ["android"]`, package `com.zuroy.go`
- `npx expo install expo-dev-client` — Dev Client (not Expo Go)
- `npx expo install react-native-nfc-manager` — add to `plugins` in `app.json`
- `metro.config.js` — minimal config (SDK 54 auto-detects monorepo)
- `apps/go/App.tsx` — entry point with branded splash stub
- `apps/go/vitest.config.ts`

**Metro config (SDK 54 — mostly automatic):**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// SDK 54 auto-configures watchFolders and nodeModulesPaths for monorepos
// Only add manual config if you need package exports resolution:
config.resolver.unstable_enablePackageExports = true;
module.exports = config;
```

> **Research insight:** Since Expo SDK 52, Metro auto-detects monorepos. SDK 54 enables `unstable_enablePackageExports` by default (respects `exports` field in package.json). Manual `watchFolders`/`nodeModulesPaths` config is no longer needed.

**Success criteria:** `yarn dev` starts all 4 apps. API responds at `localhost:3001/v1/health`. Portal at `localhost:3000`. Connect at `localhost:3002`. Go Metro bundler at `localhost:8081`.

---

### Phase 4: Dev Tooling & CI (deferred to Phase 1.5)

Set up after first feature lands:

- GitHub Actions workflow (lint → test → build → coverage gate)
- Playwright config for Portal + Connect
- Detox config for Go (requires Android emulator — `reactivecircus/android-emulator-runner` in GHA)
- 100% coverage enforcement in CI
- Redis in Docker Compose + BullMQ queue setup + Bull Board
- `@zuroy/ui` package extraction (when 2+ apps share a real component)
- `RolesGuard` + `TenantGuard` (when building first role-restricted endpoint)
- `ZodValidationPipe` (when building first POST/PUT endpoint)
- AuditLog model + NestJS interceptor
- Dockerfiles per app (production builds)

## Security Roadmap

| Priority | Item                                                               | When                    |
| -------- | ------------------------------------------------------------------ | ----------------------- |
| **P0**   | JWT secret validation at startup (reject dev default in prod)      | Phase 1 scaffold        |
| **P0**   | Provisioning token: 256-bit entropy, 10-min expiry, single-use     | First feature           |
| **P0**   | Tenant isolation: Prisma middleware auto-scopes by `hotelId`       | First feature           |
| **P1**   | `@nestjs/throttler` rate limiting (login: 5/15min)                 | Phase 1 scaffold        |
| **P1**   | Helmet + security headers                                          | Phase 1 scaffold        |
| **P1**   | CORS whitelist (not wildcard)                                      | Phase 1 scaffold        |
| **P2**   | Refresh token rotation (httpOnly cookies, one-time use)            | Auth feature            |
| **P2**   | Response serialization (strip `passwordHash` from responses)       | First CRUD endpoint     |
| **P2**   | Role-hotelId invariant enforcement (HOTEL_STAFF must have hotelId) | User management feature |
| **P3**   | AuditLog model + interceptor                                       | Before staging          |
| **P3**   | PII encryption at rest (guest data)                                | Before production       |
| **P3**   | Redis authentication in non-dev environments                       | Before production       |

## Risk Analysis

| Risk                                    | Mitigation                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Prisma client not found in workspace    | Custom output path `../generated/client`, `postinstall` script for `prisma generate`                  |
| Metro can't resolve workspace packages  | SDK 54 auto-detects monorepos. `unstable_enablePackageExports` for `exports` maps.                    |
| MUI + Tailwind CSS conflicts            | MUI v6 `enableCssLayer: true` + CSS `@layer` ordering                                                 |
| NestJS decorators fail in Vitest        | `unplugin-swc` + `.swcrc` with `legacyDecorator` + `decoratorMetadata`                                |
| NestJS can't transpile raw TS packages  | `tsconfig.json` `include` + `paths` for workspace packages                                            |
| Expo Go doesn't support NFC             | Dev Client from day 1                                                                                 |
| Yarn v1 duplicate React in Expo         | `nohoist` for `react-native` and `expo` in root workspaces config                                     |
| Cross-tenant data leaks                 | Prisma middleware auto-injects `hotelId` filter. `TenantGuard` compares JWT `hotelId` to route param. |
| Provisioning token replay               | Single-use enforcement, 10-min expiry, device binding after first use                                 |
| Stale Prisma client after schema change | `turbo db:generate` in task dependencies. Reminder in CONTRIBUTING.md.                                |

## Unresolved Questions

- BullMQ: embed Bull Board in API or separate service?
- AMAPI: when to start EMM partnership application? (non-blocking for code)
- Hotspot management: API-controlled or manual on-device?
- i18n library for Go: `react-i18next` or `expo-localization` + custom?
- Overlapping reservation prevention: app-level advisory lock or raw SQL exclusion constraint (`tsrange` + `EXCLUDE USING gist`)?
- Refresh tokens: httpOnly cookie or Authorization header? Affects XSS/CSRF tradeoff.
- Device auth: shared-secret enrollment or Android Play Integrity attestation?
- `@zuroy/api-client` package: typed API client shared across frontends, or generate from OpenAPI spec?

## References

- [Turborepo — Configuring Tasks (v2)](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)
- [Turborepo — Prisma Guide](https://turborepo.dev/docs/guides/tools/prisma)
- [Prisma — Turborepo Monorepo Guide](https://www.prisma.io/docs/guides/turborepo)
- [Colin Hacks — Live Types in a TypeScript Monorepo](https://colinhacks.com/essays/live-types-typescript-monorepo)
- [MUI — Next.js Integration](https://mui.com/material-ui/integrations/nextjs/)
- [MUI — CSS Layers](https://mui.com/material-ui/customization/css-layers.md)
- [Expo — Work with Monorepos](https://docs.expo.dev/guides/monorepos/)
- [NestJS v11 Announcement](https://trilon.io/blog/announcing-nestjs-11-whats-new)
- [NestJS — SWC Recipe](https://docs.nestjs.com/recipes/swc)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
