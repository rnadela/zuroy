---
title: Redis + BullMQ Infrastructure
type: feat
date: 2026-03-29
---

# Redis + BullMQ Infrastructure

## Overview

Add Redis for JWT blacklist + caching, and BullMQ for async job processing (checkout auto-purge scheduling). Includes Bull Board UI for queue monitoring.

## Implementation Phases

### Phase 1: Redis Connection

- [ ] Add Redis to docker-compose.yml (dev) and infra/docker/docker-compose.yml (prod)
- [ ] Install `ioredis` and `@nestjs/bullmq bullmq` in API
- [ ] Create `apps/api/src/redis/redis.module.ts` — global Redis provider using ioredis
- [ ] Create `apps/api/src/redis/redis.service.ts` — wraps ioredis client
- [ ] Add `REDIS_URL` to .env.example and .env

### Phase 2: JWT Blacklist

- [ ] Create `apps/api/src/auth/jwt-blacklist.service.ts` — `blacklist(jti, ttl)`, `isBlacklisted(jti)` using Redis SET with TTL
- [ ] Update `AuthService.login()` — include `jti` (UUID) in JWT payload
- [ ] Update `JwtStrategy.validate()` — check if token jti is blacklisted, reject if so
- [ ] Create `POST /v1/auth/logout` endpoint — blacklists current token's jti
- [ ] Update shared `JwtPayload` type — add `jti` field

### Phase 3: BullMQ Queues

- [ ] Install `@nestjs/bullmq bullmq`
- [ ] Create `apps/api/src/queues/queues.module.ts` — register BullMQ with Redis connection
- [ ] Create `apps/api/src/queues/checkout-purge.processor.ts` — processes scheduled checkout purges
- [ ] Create `apps/api/src/queues/checkout-purge.service.ts` — schedules purge job at reservation checkout time
- [ ] Update `ReservationsService.checkIn()` — schedule auto-purge job for checkout date
- [ ] Update `ReservationsService.checkOut()` — cancel scheduled purge (manual checkout)

### Phase 4: Bull Board UI

- [ ] Install `@bull-board/api @bull-board/express @bull-board/nestjs`
- [ ] Mount Bull Board at `/v1/admin/queues` (SUPER_ADMIN only)
- [ ] Show checkout-purge queue status

## Acceptance Criteria

- [ ] Redis connected and healthy (add to health check)
- [ ] JWT blacklist works — logout invalidates token immediately
- [ ] Auto-purge job scheduled on check-in, fires at checkout time
- [ ] Manual check-out cancels the scheduled purge
- [ ] Bull Board accessible at /v1/admin/queues for admins
