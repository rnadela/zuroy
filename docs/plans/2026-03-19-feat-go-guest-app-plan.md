---
title: Go Guest App — Expo Android
type: feat
date: 2026-03-19
---

# Go Guest App — Expo Android

## Overview

Build the Zuroy Go guest app — Expo React Native for Android. The app runs on hotel-provided phones in kiosk mode. On NFC tap, it fetches guest config from the API and shows a branded experience with service ordering and amenities.

## Current State

Stub Expo app at `apps/go/` with expo-router, react-native-nfc-manager, Dev Client configured.

## MVP Scope (this plan)

1. **Provisioning screen** — awaiting NFC tap, reads provisioning token
2. **Welcome screen** — hotel-branded (logo, colors), guest name, room, checkout date
3. **Service ordering** — browse service catalog, place orders (charge to room)
4. **Amenity explorer** — browse by category, detail view
5. **Tab navigation** — Home, Services, Amenities, Info

## Deferred

- NFC actual read (needs physical device — mock for now)
- Google Maps integration (amenity/partner map view)
- Partners directory (API not built)
- Stay extension requests
- Hotspot info
- i18n
- Push notifications
- Checkout purge listener

## Implementation Phases

### Phase 1: Navigation + API Client

- [ ] `app/_layout.tsx` — root layout with provisioning check
- [ ] `app/(tabs)/_layout.tsx` — bottom tab navigator (Home, Services, Amenities, Info)
- [ ] `src/lib/api.ts` — API client with device token header (X-Device-Token)
- [ ] `src/lib/store.ts` — simple state: provisioned flag, guest config, hotel branding
- [ ] `app/provision.tsx` — provisioning screen (mock: text input for token, calls POST /v1/devices/provision)

### Phase 2: Welcome + Branding

- [ ] `app/(tabs)/index.tsx` — Home/Welcome screen showing hotel branding (logo, colors, background), guest name, room number, checkout date
- [ ] Dynamic theming: apply hotel's primaryColor/secondaryColor to UI
- [ ] `app/(tabs)/info.tsx` — Hotel info screen (address, contact)

### Phase 3: Service Ordering

- [ ] `app/(tabs)/services/index.tsx` — service catalog by category
- [ ] `app/(tabs)/services/[id].tsx` — service item detail + order button
- [ ] Order flow: select quantity, add notes, confirm → POST to API
- [ ] `app/(tabs)/services/orders.tsx` — list of guest's service requests with status

### Phase 4: Amenity Explorer

- [ ] `app/(tabs)/amenities/index.tsx` — amenity categories (auto-hide empty)
- [ ] `app/(tabs)/amenities/[id].tsx` — amenity detail (name, description, hours, photos)

## Route Structure

```
apps/go/app/
├── _layout.tsx              # Root: check if provisioned
├── provision.tsx             # Provisioning input screen
├── (tabs)/
│   ├── _layout.tsx          # Bottom tabs
│   ├── index.tsx            # Welcome/Home
│   ├── services/
│   │   ├── index.tsx        # Service catalog
│   │   ├── [id].tsx         # Service detail + order
│   │   └── orders.tsx       # My orders
│   ├── amenities/
│   │   ├── index.tsx        # Category list
│   │   └── [id].tsx         # Amenity detail
│   └── info.tsx             # Hotel info
```

## Acceptance Criteria

- [ ] Provisioning screen accepts token + fetches guest config
- [ ] Welcome screen shows hotel branding + guest info
- [ ] Service catalog loads from API, can place orders
- [ ] Amenities browsable by category
- [ ] Tab navigation works
- [ ] App builds for Android
