---
title: CI/CD + Testing Setup
type: feat
date: 2026-03-29
---

# CI/CD + Testing Setup

## Overview

Add GitHub Actions CI pipeline, Vitest configs for all apps, and basic test coverage. Per CLAUDE.md: 100% coverage required (deferred enforcement — set up infrastructure now, gate later).

## Implementation Phases

### Phase 1: Vitest Configs for Web Apps

API already has Vitest configured. Add to Portal + Connect.

- [ ] `apps/portal/vitest.config.ts` — React Testing Library + jsdom
- [ ] `apps/connect/vitest.config.ts` — same pattern
- [ ] Install deps: `vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Add `test` script to portal + connect package.json

### Phase 2: Smoke Tests per App

One smoke test per app to verify the test harness works.

- [ ] `apps/api/src/health/health.controller.spec.ts` — test health endpoint returns OK
- [ ] `apps/portal/src/app/login/page.test.tsx` — renders login form
- [ ] `apps/connect/src/app/login/page.test.tsx` — renders login form

### Phase 3: GitHub Actions CI Workflow

- [ ] `.github/workflows/ci.yml` — lint → test → build on push/PR
- [ ] PostgreSQL service container for API tests
- [ ] Turbo cache for faster builds
- [ ] Node 20 setup
- [ ] Coverage report (no gate yet — add when coverage is meaningful)

### Phase 4: Linting

- [ ] Add `lint` script to portal + connect package.json (already exists)
- [ ] Verify `yarn lint` works across all apps via turbo

## Route Structure

```
.github/
└── workflows/
    └── ci.yml
apps/
├── api/vitest.config.ts (exists)
├── portal/vitest.config.ts (new)
└── connect/vitest.config.ts (new)
```

## Acceptance Criteria

- [ ] `yarn test` runs Vitest across API, Portal, Connect
- [ ] At least 1 passing test per app
- [ ] GitHub Actions CI runs on push to main
- [ ] CI installs deps, runs lint, test, build
- [ ] CI uses PostgreSQL service for API tests
