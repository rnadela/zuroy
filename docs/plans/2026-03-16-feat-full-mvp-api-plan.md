---
title: Full MVP API — All Domain Modules
type: feat
date: 2026-03-16
---

# Full MVP API — All Domain Modules

## Enhancement Summary

**Deepened on:** 2026-03-16
**Agents used:** best-practices-researcher, security-sentinel, architecture-strategist, performance-oracle, code-simplicity-reviewer

### Key Improvements

1. **Consolidated 10 phases → 5** — merged simple CRUD modules, moved schema upfront, deferred Partners
2. **Prisma Client Extensions + nestjs-cls** for tenant isolation — replaces fragile middleware approach
3. **TenantGuard** for URL param cross-check — defense-in-depth against cross-tenant access
4. **Device auth via API key** — heartbeat/provision no longer unauthenticated
5. **Server-computed charges** — `chargeAmount = price * quantity`, never from client
6. **Cursor-based pagination** on all list endpoints
7. **Resolved all open questions** — DB exclusion constraint for double-booking, URLs-only for photos, computed charges

### Resolved Questions

- **Charges:** Server-computed (`ServiceItem.price * quantity`). Staff can add `adjustment` field for comps/overrides.
- **Room availability:** DB exclusion constraint with `btree_gist` + `tsrange`. Race-condition-proof.
- **Photos:** URLs only (external hosting). File upload deferred to separate plan.

---

## Overview

Build all NestJS domain modules for the Zuroy API MVP. Currently only auth/health/prisma infrastructure exists. This adds Hotels, Users, Rooms, Devices, Reservations, Services, and Amenities — covering the core backend for Portal, Connect, and Go.

## Current State

**Exists:** AuthModule, HealthModule, PrismaModule, ZodValidationPipe, JwtAuthGuard, @Public()
**Prisma models:** Hotel, User, Room, Device, Reservation (5 models, 3 enums)
**Missing:** All domain CRUD modules, tenant isolation, roles guard, additional models

## Implementation Phases

### Phase 1: Foundation + Schema Extension

Guards, tenant isolation, all remaining Prisma models upfront.

> **Research insight:** Add all models in one migration before building modules. Models sit inert until consumed — zero runtime cost. Avoids mid-implementation schema changes.

**1a. Guards + Tenant Isolation:**

- [ ] `apps/api/src/auth/decorators/roles.decorator.ts` — `@Roles()` using SetMetadata + `Role` enum from `@zuroy/database`
- [ ] `apps/api/src/auth/guards/roles.guard.ts` — reads `@Roles()` metadata via Reflector, checks `req.user.role`
- [ ] `apps/api/src/auth/guards/tenant.guard.ts` — compares `req.params.hotelId` against `req.user.hotelId` (HOTEL_STAFF must match, SUPER_ADMIN passes)
- [ ] `apps/api/src/auth/guards/tenant-context.guard.ts` — sets `hotelId` in CLS context from JWT (runs after JwtAuthGuard)
- [ ] `apps/api/src/prisma/prisma-tenant.extension.ts` — Prisma Client Extension using `$extends` + `nestjs-cls` to auto-inject `hotelId` on tenant-scoped models
- [ ] Update `PrismaService` with `get tenant()` accessor returning extended client
- [ ] Install `nestjs-cls` — `yarn workspace api add nestjs-cls`
- [ ] Register global APP_GUARDs in order: ThrottlerGuard → JwtAuthGuard → RolesGuard → TenantContextGuard
- [ ] Remove/restrict `@Public()` on `POST /v1/auth/register` — all user creation via UsersModule (SUPER_ADMIN only)

> **Security insight:** Guard order is critical. JwtAuthGuard must run before RolesGuard (needs `req.user`). TenantContextGuard must run after JwtAuthGuard (needs `req.user.hotelId`). TenantGuard applied at controller level on nested routes.

> **Architecture insight:** Do NOT use Prisma middleware that silently mutates queries. Use Prisma Client Extensions with `$allModels.$allOperations` — transparent, testable, and skips non-tenant models (Partner, Hotel). Services call `this.prisma.tenant.room.findMany()` instead of `this.prisma.room.findMany()`.

**1b. Prisma Schema Extension:**

- [ ] Add `Amenity` model — name, description, category, hotelId (FK), lat, lng, hours, photoUrls[], timestamps
- [ ] Add `ServiceItem` model — name, description, category, price (@db.Decimal(10,2)), hotelId (FK), available, timestamps
- [ ] Add `ServiceRequest` model — reservationId (FK), itemId (FK), hotelId, quantity, notes, status, chargeAmount (@db.Decimal(10,2)), timestamps
- [ ] Add `ServiceRequestStatus` enum — PENDING, COMPLETED, CANCELLED (3 statuses, not 5 — add granularity when staff request it)
- [ ] Add indexes: `@@index([hotelId, status])` on ServiceRequest, `@@index([reservationId])` on ServiceRequest, `@@index([hotelId, category])` on Amenity and ServiceItem
- [ ] Fix Reservation index: replace `@@index([roomId, status, checkIn, checkOut])` with `@@index([roomId, checkIn, checkOut])` (status as NOT IN can't use B-tree prefix)
- [ ] Add `@@index([hotelId, status, checkIn])` on Reservation (for filtered list queries)
- [ ] Add `btree_gist` exclusion constraint via raw SQL migration for double-booking prevention
- [ ] Run migration: `prisma migrate dev --name add-amenity-service-models`

> **Performance insight:** The composite index `[roomId, status, checkIn, checkOut]` is suboptimal — `status` appears as NOT IN (can't use B-tree equality prefix). Replace with `[roomId, checkIn, checkOut]`. Add `[hotelId, status, checkIn]` for filtered list views.

**Acceptance criteria:**

- [ ] `@Roles(Role.SUPER_ADMIN)` restricts endpoints to super-admins
- [ ] HOTEL_STAFF can only access data for their own hotel (tenant extension auto-scopes)
- [ ] TenantGuard rejects `req.params.hotelId` mismatches for HOTEL_STAFF
- [ ] SUPER_ADMIN can access all hotels (CLS hotelId = null, extension skips filter)
- [ ] All new models exist in DB with proper indexes

---

### Phase 2: Core Entities (Hotels + Users + Rooms)

Three simple CRUD modules — structurally identical.

> **Simplicity insight:** Hotels, Users, Rooms are all standard CRUD on existing models. No new models, no complex logic. Build together in one phase.

**Zod schemas (in `apps/api/src/{module}/dto/`):**

> **Simplicity insight:** Keep Zod schemas in the API module, not `@zuroy/shared`. Only move to shared when a second consumer (Portal/Connect forms) needs them.

- [ ] `create-hotel.dto.ts` — name, slug, address?, lat?, lng?, branding fields
- [ ] `create-user.dto.ts` — email, password, firstName, lastName, role, hotelId
- [ ] `create-room.dto.ts` — number, floor?, type?
- [ ] Update DTOs use `.partial()` inline — no separate schema files

**Hotels Module:**

- [ ] `apps/api/src/hotels/hotels.module.ts`
- [ ] `apps/api/src/hotels/hotels.controller.ts` — CRUD at `/v1/hotels`
- [ ] `apps/api/src/hotels/hotels.service.ts`
- [ ] Access: SUPER_ADMIN for write ops. HOTEL_STAFF can GET own hotel only.

**Users Module:**

- [ ] `apps/api/src/users/users.module.ts`
- [ ] `apps/api/src/users/users.controller.ts` — CRUD at `/v1/users`
- [ ] `apps/api/src/users/users.service.ts`
- [ ] Access: SUPER_ADMIN creates any user. HOTEL_STAFF views own hotel staff.
- [ ] Validation: HOTEL_STAFF role requires non-null hotelId. Reject SUPER_ADMIN creation unless requester is SUPER_ADMIN.

> **Security insight:** Once UsersModule exists, remove `@Public()` from register endpoint. All user creation through UsersModule (SUPER_ADMIN only). Eliminates unrestricted account creation.

**Rooms Module:**

- [ ] `apps/api/src/rooms/rooms.module.ts`
- [ ] `apps/api/src/rooms/rooms.controller.ts` — CRUD at `/v1/hotels/:hotelId/rooms`, `@UseGuards(TenantGuard)`
- [ ] `apps/api/src/rooms/rooms.service.ts` — uses `this.prisma.tenant.room.*`

---

### Phase 3: Devices Module

Fleet management with device auth.

**Device Auth (MVP stopgap):**

- [ ] `apps/api/src/auth/guards/device-token.guard.ts` — validates `X-Device-Token` header against per-device API key
- [ ] On device registration (`POST /v1/devices`), generate a per-device API key, store hash in `Device.enrollmentCode`
- [ ] Return the raw key once — device stores it securely
- [ ] Heartbeat and provision endpoints require this key

> **Security insight:** Device heartbeat MUST NOT be unauthenticated. At minimum, use a per-device API key. CUIDs are partially predictable (timestamp prefix) — an unauthenticated endpoint enables data poisoning and fleet enumeration.

**Endpoints:**

- [ ] `POST /v1/devices` — register device, generate API key (SUPER_ADMIN)
- [ ] `GET /v1/devices` — list all (SUPER_ADMIN) or by hotel (HOTEL_STAFF)
- [ ] `PATCH /v1/devices/:id` — update info (SUPER_ADMIN)
- [ ] `POST /v1/devices/:id/assign` — assign to hotel (SUPER_ADMIN)
- [ ] `POST /v1/devices/:id/unassign` — remove from hotel (SUPER_ADMIN)
- [ ] `POST /v1/devices/:id/heartbeat` — device health ping (DeviceTokenGuard)
- [ ] `POST /v1/devices/provision` — provision with token (DeviceTokenGuard) — place here, not in Reservations, to avoid circular deps

> **Architecture insight:** Provision endpoint belongs in DevicesController. ReservationsService generates the token (writes to DB), DevicesService consumes it (reads from DB). No module-level dependency needed.

---

### Phase 4: Reservations Module

Core check-in/out flow — most complex module.

**Endpoints:**

- [ ] `POST /v1/hotels/:hotelId/reservations` — create reservation
- [ ] `GET /v1/hotels/:hotelId/reservations` — list with status/date filters + cursor pagination
- [ ] `GET /v1/hotels/:hotelId/reservations/:id` — get details
- [ ] `PATCH /v1/hotels/:hotelId/reservations/:id` — update
- [ ] `POST /v1/hotels/:hotelId/reservations/:id/check-in` — assign device, generate provisioning token
- [ ] `POST /v1/hotels/:hotelId/reservations/:id/check-out` — clear device assignment, update status

**Check-in flow:**

1. Validate reservation status === PENDING (atomic: `UPDATE ... WHERE status = 'PENDING'`)
2. Generate token: `crypto.randomBytes(32).toString('hex')`
3. Hash token (SHA-256) before storing in DB
4. Set `provisioningTokenExpiresAt` to now + 5 minutes
5. Set `deviceId` on reservation
6. Return raw token to staff (displayed as NFC payload)

**Check-out flow:**

1. Validate reservation status === CHECKED_IN
2. Atomic update: status → CHECKED_OUT, clear provisioningToken + deviceId
3. Future: trigger CLEAR_APP_DATA via AMAPI (deferred)

> **Security insight:** Hash provisioning tokens before storage. Use atomic update for single-use enforcement: `WHERE provisioningToken = :hash AND provisioningTokenExpiresAt > NOW() AND deviceId IS NULL`. If rows affected = 0, token is invalid/used/expired. Require device identity in provision request.

> **Performance insight:** Add cursor-based pagination to reservation list (default 25 items). At 10K reservations/year, unfiltered list is unacceptable. Use `createdAt` or `id` as cursor — offset-based degrades at high offsets.

---

### Phase 5: Amenities + Services

Hotel amenity catalog and service ordering/charge tracking.

**Amenities Module:**

- [ ] `apps/api/src/amenities/amenities.module.ts`
- [ ] `apps/api/src/amenities/amenities.controller.ts` — CRUD at `/v1/hotels/:hotelId/amenities`
- [ ] `apps/api/src/amenities/amenities.service.ts`
- [ ] GET is `@Public()` (guest app reads). POST/PATCH/DELETE require HOTEL_STAFF.
- [ ] Category filter: `?category=dining`

**Services Module (Catalog + Requests):**

- [ ] `apps/api/src/services/services.module.ts`
- [ ] `apps/api/src/services/service-catalog.controller.ts` — items CRUD at `/v1/hotels/:hotelId/services`
- [ ] `apps/api/src/services/service-requests.controller.ts` — request lifecycle
- [ ] `apps/api/src/services/service-catalog.service.ts`
- [ ] `apps/api/src/services/service-requests.service.ts`

> **Architecture insight:** Keep two controllers in one module (different resources, different auth). Rename service class to `ServiceCatalogService` to avoid "service" overload.

**Service Request endpoints:**

- [ ] `POST /v1/hotels/:hotelId/reservations/:reservationId/requests` — create request (device auth)
- [ ] `GET /v1/hotels/:hotelId/requests` — staff views all pending (HOTEL_STAFF)
- [ ] `PATCH /v1/hotels/:hotelId/requests/:id/status` — staff transitions status
- [ ] `GET /v1/hotels/:hotelId/reservations/:reservationId/charges` — charge summary

**Charge computation:**

> **Security insight:** `chargeAmount` is server-computed: `ServiceItem.price * quantity`. NEVER accept from client. Guest DTO: `{ itemId, quantity, notes }` only. Service looks up price and computes charge. Validate `quantity` as positive integer, max 99.

> **Performance insight:** Compute charge summary at query time (`SUM(chargeAmount) WHERE reservationId = X`). At 10-50 requests per reservation, this is sub-millisecond. Don't denormalize until list views need inline totals.

**N+1 prevention:**

```typescript
// Always use include for dashboard query
findPending(hotelId: string) {
  return this.prisma.tenant.serviceRequest.findMany({
    where: { status: 'PENDING' },
    include: { reservation: { include: { room: true } }, item: true },
  });
}
```

---

## Guard Execution Order

```
Request
  → ThrottlerGuard     (rate limit)
  → JwtAuthGuard       (authenticate, set req.user — skips if @Public())
  → RolesGuard         (check @Roles() metadata — passes if no decorator)
  → TenantContextGuard (set CLS hotelId from req.user.hotelId)
  → TenantGuard        (controller-level: verify URL :hotelId matches JWT)
  → Handler
```

## Module Registration

```typescript
imports: [
  ClsModule.forRoot({ global: true, middleware: { mount: true } }),
  ConfigModule.forRoot({ isGlobal: true }),
  ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
  PrismaModule,
  AuthModule,
  HealthModule,
  HotelsModule,
  UsersModule,
  RoomsModule,
  DevicesModule,
  ReservationsModule,
  AmenitiesModule,
  ServicesModule,
]
```

## Acceptance Criteria

- [ ] All 7 domain modules scaffolded and working
- [ ] Zod validation on all POST/PATCH endpoints
- [ ] Role-based access (SUPER_ADMIN vs HOTEL_STAFF) enforced via global RolesGuard
- [ ] Tenant isolation via Prisma Client Extension + nestjs-cls + TenantGuard
- [ ] Device auth via per-device API key on heartbeat/provision endpoints
- [ ] Check-in generates hashed provisioning token with 5-min expiry, single-use
- [ ] Check-out clears device assignment + provisioning token
- [ ] Service request charges server-computed from item price * quantity
- [ ] Cursor-based pagination on reservation list
- [ ] DB exclusion constraint prevents room double-booking
- [ ] All endpoints respond with consistent JSON structure
- [ ] API builds and starts successfully

## Deferred (not in this plan)

- **Partners module** — marketplace feature, not hotel ops. Build when Go app needs it.
- Stay extension workflow
- BullMQ async jobs (checkout auto-purge scheduling)
- MDM / AMAPI integration
- Hotspot management
- Push notifications
- Refresh token rotation (Redis)
- Response envelope interceptor (TransformInterceptor)

## Security Roadmap (from review)

| Priority | Item | Phase |
|---|---|---|
| **P0** | Remove @Public() from register once UsersModule exists | Phase 2 |
| **P0** | Device auth (per-device API key) on heartbeat/provision | Phase 3 |
| **P0** | TenantGuard on all nested `/hotels/:hotelId/*` routes | Phase 2-5 |
| **P0** | Hash provisioning tokens, atomic single-use consumption | Phase 4 |
| **P1** | Server-compute chargeAmount, never from client | Phase 5 |
| **P1** | Status preconditions on check-in/out (atomic updates) | Phase 4 |
| **P1** | `JwtPayload.role` typed as `Role` union, not `string` | Phase 1 |
| **P2** | Validate photoUrls (https only, domain allowlist) | Phase 5 |
| **P2** | CORS origins from env var | Before deploy |
| **P2** | Password complexity + max(128) | Phase 2 |
