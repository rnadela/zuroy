---
title: Portal Admin Dashboard
type: feat
date: 2026-03-19
---

# Portal Admin Dashboard

## Overview

Build the Zuroy Portal frontend — a Next.js App Router admin dashboard with MUI + Tailwind. Super-admin manages hotels, devices, and users. Consumes the existing API at `/v1`.

## Current State

**Portal app exists** at `apps/portal/` — Next.js 15, Tailwind 4, stub page. No MUI, no auth, no API calls.
**API ready** — all endpoints at `localhost:3001/v1` (Hotels CRUD, Users CRUD, Devices CRUD + assign, Health).

## Implementation Phases

### Phase 1: Auth + Layout Shell

Set up JWT auth flow and the admin layout with sidebar navigation.

- [ ] Install MUI: `@mui/material @emotion/react @emotion/styled @mui/icons-material`
- [ ] Set up MUI AppRouterCacheProvider with `enableCssLayer: true`
- [ ] Add CSS layer ordering in `globals.css`: `@layer theme, base, mui, components, utilities;`
- [ ] Create `src/lib/api.ts` — fetch wrapper with JWT token from cookie/localStorage
- [ ] Create `src/lib/auth.ts` — login function, token storage, logout
- [ ] Create `src/app/login/page.tsx` — email/password form, calls POST /v1/auth/login
- [ ] Create `src/components/AuthProvider.tsx` — context for auth state, redirect to /login if no token
- [ ] Create `src/app/(dashboard)/layout.tsx` — sidebar nav + top bar with user info
- [ ] Sidebar links: Dashboard, Hotels, Devices, Users
- [ ] Create `src/app/(dashboard)/page.tsx` — dashboard home (placeholder stats)

### Phase 2: Hotels Management

CRUD for hotels with branding config.

- [ ] Create `src/app/(dashboard)/hotels/page.tsx` — list all hotels in MUI DataGrid/Table
- [ ] Create `src/app/(dashboard)/hotels/new/page.tsx` — create hotel form
- [ ] Create `src/app/(dashboard)/hotels/[id]/page.tsx` — hotel detail/edit form
- [ ] Form fields: name, slug, address, lat/lng, logoUrl, primaryColor, secondaryColor, backgroundUrl
- [ ] Color picker for primary/secondary colors
- [ ] Delete hotel with confirmation dialog
- [ ] Branding preview panel (show logo + colors)

### Phase 3: Device Fleet Management

Register, assign, monitor devices.

- [ ] Create `src/app/(dashboard)/devices/page.tsx` — device list with status badges (online/offline/assigned/unassigned)
- [ ] Create `src/app/(dashboard)/devices/new/page.tsx` — register device form (serial number, model)
- [ ] Show API key once after creation (copy-to-clipboard)
- [ ] Create `src/app/(dashboard)/devices/[id]/page.tsx` — device detail (status, battery, app version, last heartbeat)
- [ ] Assign/unassign device to hotel (dropdown select)
- [ ] Filter devices by hotel, status

### Phase 4: User Management

Create and manage staff accounts.

- [ ] Create `src/app/(dashboard)/users/page.tsx` — user list with role badges
- [ ] Create `src/app/(dashboard)/users/new/page.tsx` — create user form (email, password, name, role, hotel assignment)
- [ ] Create `src/app/(dashboard)/users/[id]/page.tsx` — user detail/edit
- [ ] Hotel dropdown only shown when role = HOTEL_STAFF
- [ ] Delete user with confirmation

## Technical Approach

### API Client

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('zuroy_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### Route Structure

```
apps/portal/src/app/
├── login/page.tsx                    # Public login
├── (dashboard)/                      # Auth-protected layout group
│   ├── layout.tsx                    # Sidebar + topbar
│   ├── page.tsx                      # Dashboard home
│   ├── hotels/
│   │   ├── page.tsx                  # Hotel list
│   │   ├── new/page.tsx              # Create hotel
│   │   └── [id]/page.tsx            # Hotel detail/edit
│   ├── devices/
│   │   ├── page.tsx                  # Device list
│   │   ├── new/page.tsx              # Register device
│   │   └── [id]/page.tsx            # Device detail
│   └── users/
│       ├── page.tsx                  # User list
│       ├── new/page.tsx              # Create user
│       └── [id]/page.tsx            # User detail/edit
├── layout.tsx                        # Root layout (MUI theme)
└── globals.css                       # Tailwind + CSS layers
```

### MUI + Tailwind Integration

Use MUI v6 `enableCssLayer` wrapping all Emotion styles in `@layer mui`. CSS layer order declaration ensures Tailwind utilities win over MUI defaults.

## Acceptance Criteria

- [ ] Login page authenticates against API and stores JWT
- [ ] Protected routes redirect to login when no token
- [ ] Dashboard layout with sidebar navigation
- [ ] Hotels: list, create, edit, delete with branding fields
- [ ] Devices: list with status, register, assign/unassign to hotels
- [ ] Users: list, create with role/hotel assignment, edit, delete
- [ ] All forms validate input before submission
- [ ] Error states shown with MUI Alert/Snackbar
- [ ] Responsive layout (desktop-first, works on tablet)

## Deferred

- Partners management (API not built yet)
- Usage analytics / charts
- Remote device wipe (AMAPI integration)
- Device health monitoring dashboard (real-time)
