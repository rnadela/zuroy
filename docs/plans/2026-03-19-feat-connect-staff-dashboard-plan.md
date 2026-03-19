---
title: Connect Staff Dashboard
type: feat
date: 2026-03-19
---

# Connect Staff Dashboard

## Overview

Build the Zuroy Connect frontend — Next.js hotel staff dashboard with MUI + Tailwind. Front desk manages rooms, reservations (check-in/out), service requests, and amenities. Scoped to one hotel (from JWT hotelId).

## Current State

**Connect app exists** at `apps/connect/` — Next.js 15, Tailwind 4, stub page. No MUI, no auth.
**API ready** — all tenant-scoped endpoints under `/v1/hotels/:hotelId/*`.

## Key Difference from Portal

Portal is for SUPER_ADMIN (Zuroy team) — sees all hotels. Connect is for HOTEL_STAFF — sees only their assigned hotel. The JWT contains `hotelId` which scopes all API calls.

## Implementation Phases

### Phase 1: Auth + Layout

- [ ] Install MUI deps (same as portal)
- [ ] Copy ThemeRegistry, api.ts, auth.ts from portal (shared patterns)
- [ ] Login page at `/login`
- [ ] Dashboard layout with sidebar: Dashboard, Rooms, Reservations, Service Requests, Amenities
- [ ] Auth context reads `hotelId` from JWT user object, injects into all API calls
- [ ] Dashboard home: occupancy overview (rooms occupied/total), today's check-ins/outs

### Phase 2: Room Management

- [ ] `(dashboard)/rooms/page.tsx` — room list (number, floor, type, status)
- [ ] `(dashboard)/rooms/new/page.tsx` — create room form
- [ ] `(dashboard)/rooms/[id]/page.tsx` — edit room

### Phase 3: Reservations + Check-in/out

- [ ] `(dashboard)/reservations/page.tsx` — reservation list with status filter + date range
- [ ] `(dashboard)/reservations/new/page.tsx` — create reservation (guest name, room select, dates)
- [ ] `(dashboard)/reservations/[id]/page.tsx` — reservation detail with:
  - Guest info, room, dates, status
  - **Check-in button**: calls POST `.../check-in` with device select dropdown. Shows provisioning token in large text (for NFC writing)
  - **Check-out button**: calls POST `.../check-out` with confirmation
  - Room charges section: shows itemized service request charges + total

### Phase 4: Service Requests

- [ ] `(dashboard)/requests/page.tsx` — pending service requests list (guest, room, item, time)
- [ ] Status update buttons: Mark Completed, Cancel
- [ ] Filter by status (PENDING, COMPLETED, CANCELLED)

### Phase 5: Amenity Management

- [ ] `(dashboard)/amenities/page.tsx` — amenity list by category
- [ ] `(dashboard)/amenities/new/page.tsx` — create amenity form
- [ ] `(dashboard)/amenities/[id]/page.tsx` — edit amenity

## Route Structure

```
apps/connect/src/app/
├── login/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                          # Dashboard home
│   ├── rooms/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── reservations/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx                # Detail + check-in/out
│   ├── requests/page.tsx                 # Service requests
│   └── amenities/
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [id]/page.tsx
├── layout.tsx
└── globals.css
```

## Acceptance Criteria

- [ ] Login authenticates HOTEL_STAFF against API
- [ ] All API calls scoped to user's hotelId from JWT
- [ ] Room CRUD working
- [ ] Reservation CRUD with check-in/out flow
- [ ] Check-in shows provisioning token prominently
- [ ] Service requests list with status updates
- [ ] Amenity CRUD working
- [ ] Responsive layout
