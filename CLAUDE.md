# Zuroy

Hotel operations platform. Four apps in a Turborepo monorepo.

## Apps

| App | Stack | Purpose |
|---|---|---|
| `apps/api` | NestJS | Shared REST API, multi-property tenancy |
| `apps/portal` | Next.js (App Router) + MUI + Tailwind | Internal admin (fleet, partners, branding) |
| `apps/connect` | Next.js (App Router) + MUI + Tailwind | Hotel staff (reservations, check-in/out, NFC) |
| `apps/go` | Expo + React Native | Android guest app (kiosk mode, hotel branding) |
| `apps/grow` | Next.js (Phase 3) | Partner self-service portal |

## Packages

- `packages/database` — Prisma schema + migrations (PostgreSQL)
- `packages/ui` — Shared MUI components (portal + connect)
- `packages/shared` — Shared types, DTOs, validation, constants

## Tech Stack

- **Backend:** NestJS, TypeScript, JWT + RBAC (3 tiers: super-admin, hotel staff, device)
- **DB:** PostgreSQL + Prisma
- **Cache/Queue:** Redis + BullMQ (JWT blacklist, caching, DLQ)
- **Web UI:** MUI + Tailwind CSS
- **Mobile:** Expo + React Native (Android only)
- **Testing (web):** Vitest + Playwright
- **Testing (mobile):** Vitest + Detox
- **Coverage:** 100% required across all apps. CI blocks merge below 100%.
- **Validation:** Zod or class-validator (shared schemas frontend + backend)
- **Email:** SendGrid
- **Deploy:** Docker + DigitalOcean + Terraform + GitHub Actions
- **MDM:** AMAPI direct (fallback: Headwind MDM)

## Monorepo Structure

```
zuroy/
├── apps/
│   ├── api/          # NestJS backend
│   ├── portal/       # Next.js admin
│   ├── connect/      # Next.js hotel staff
│   ├── go/           # Expo guest app
│   └── grow/         # Next.js partner portal (Phase 3)
├── packages/
│   ├── database/     # Prisma schema + migrations
│   ├── ui/           # Shared MUI components
│   └── shared/       # Shared types, DTOs, constants
├── infra/            # Terraform + Dockerfiles
├── docs/             # Research, brainstorms, diagrams
├── turbo.json
└── docker-compose.yml
```

## Key Concepts

- **NFC provisioning:** USB NFC writer at front desk writes NDEF token to guest phone. App fetches config from API.
- **Guest checkout:** AMAPI `CLEAR_APP_DATA` wipes guest data without factory reset. Auto-purge at checkout time + manual staff trigger.
- **Hotspot:** Each guest phone shares 5G/LTE via WiFi hotspot. Auto-generated SSID/password. Configurable data limits per hotel.
- **Charge to room:** No in-app payments. All charges billed to room, settled at checkout via hotel's POS.
- **Partners:** Zuroy-level (not hotel-specific). Radius-based filtering (100km). Boosted/featured partners = paid placement.

## Commands

```bash
# Dev
yarn dev              # Start all apps
yarn dev --filter=api # Start specific app

# Build
yarn build

# Test
yarn test
yarn test --filter=api

# Lint + Format
yarn lint --fix
yarn prettier --write .
```

## Docs

- `docs/brainstorms/` — Product brainstorm + decisions
- `docs/research/` — AMAPI research, technical deep-dives
- `docs/diagrams/` — PlantUML workflow diagrams
