# Zuroy — Hotel App Brainstorm

**Date:** 2026-03-01
**Status:** Ready for planning

## What We're Building

**Zuroy** — a hotel operations platform with four components:

1. **Zuroy Portal** (Next.js) — Internal super-admin tool (Zuroy team only). Manages hotel onboarding, phone fleet, device-to-hotel assignments, remote wipe, OTA updates, device health monitoring, partner program.
2. **Zuroy Connect** (Next.js) — Per-hotel front desk tool. Manages reservations, room assignments, guest check-in/out, service requests. Connected to a **USB NFC writer** for provisioning guest phones.
3. **Zuroy Go** (React Native) — Android guest app. Pre-installed on bulk Android phones. Locked in MDM kiosk mode. Displays hotel-specific branding loaded from API. Handed to guest at check-in, provisioned via NFC, returned at checkout.
4. **Zuroy API** (NestJS) — Shared backend. Multi-property tenancy, real-time communication, fleet management, service request management.

**Future:** **Zuroy Grow** (Next.js) — Partner self-service portal (Phase 3).

**Phase 2 (deferred):** NFC door lock integration via Seam API (Salto KS or Dormakaba Confidant).

## Guest Flow

1. Guest arrives at front desk
2. Staff creates reservation in hotel webapp, assigns room
3. Staff taps a bulk Android phone against the **USB NFC writer** connected to their PC
4. USB writer sends an NDEF payload (provisioning token) to the phone
5. Guest app reads the NFC tag, calls backend API with the token to fetch full guest config
6. Phone now shows: hotel-branded welcome screen, room info, service ordering
7. At checkout, guest returns phone → app data is purged (auto at checkout time + manual staff trigger)
8. Phone is ready for next guest (app stays installed, all guest data wiped)

## Device Lifecycle (Zuroy Admin)

1. Zuroy team purchases bulk Android phones
2. Phones enrolled in MDM (Android Enterprise) and Zuroy guest app pre-installed
3. MDM policy locks phone to kiosk mode (only Zuroy app visible)
4. Via admin portal, Zuroy team assigns phones to a hotel
5. Phone loads that hotel's branding (logo, colors, background) from API
6. Phone shipped to hotel, front desk staff uses it for guest check-ins
7. Zuroy team monitors fleet health, pushes app updates, remotely wipes if needed

## Why This Approach

### MDM Kiosk Mode (not custom OS)
Explored three levels of Android customization:
- **Level 1: MDM kiosk** ← chosen. Stock Android, locked to single app via MDM. Branding handled in-app.
- **Level 2: Custom launcher + boot animation** — more branded but unnecessary complexity. Boot screen not important.
- **Level 3: Full AOSP ROM** — massive engineering effort (6-12 months). Only justified at 10k+ devices.

MDM kiosk is the right call because:
- Guest never sees stock Android — the Zuroy app runs fullscreen, loads hotel branding
- Remote device management (wipe, update, monitor) comes free with Android Enterprise
- No OS modification, works on any stock Android phone, no warranty voiding
- Boot screen customization explicitly deprioritized

### NFC Provisioning via USB Writer
- USB NFC writer (e.g., ACR122U) at front desk writes NDEF provisioning token to phone
- Token is short/opaque — phone fetches full guest config from API
- Physical tap = deliberate "assign this phone to this guest" action
- After provisioning, all communication is over the network

### Charge-to-Room Payments (no in-app payment processing)
Explored payment options for guest service ordering:
- **NFC card reading** — rejected. Reading credit card data via phone NFC violates PCI DSS, Stripe TOS, and card network rules. Consumer phones are not PCI PTS certified payment terminals.
- **In-app Stripe payment** — rejected. Adds PCI scope and complexity.
- **QR code to guest phone** — viable but unnecessary friction.
- **Charge to room** ← chosen. All service orders billed to the room. Guest settles the full bill at checkout using the hotel's existing POS/payment system. Zuroy only tracks charges — no payment processing.

### Separate Admin Portal
- Zuroy admin portal is an internal tool — hotels never see it
- Keeps fleet management concerns (device health, assignments, firmware) separate from hotel operations (reservations, services)
- Different user base, different permissions, different update cadence

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App names | Zuroy Portal (admin), Zuroy Connect (hotel staff), Zuroy Go (guest), Zuroy Grow (partner, Phase 3) | "Zuroy [Verb/Role]" naming pattern |
| Guest device | Bulk Android phone (not tablet) | Portable, handed out at check-in, returned at checkout |
| Device lockdown | MDM kiosk mode (Android Enterprise) | Stock Android, locked to Zuroy app. No OS modification. |
| Custom boot screen | No (deprioritized) | Guest rarely reboots. In-app branding is sufficient. |
| Hotel branding | In-app, loaded from API per hotel | Logo, colors, background customized per hotel. Managed via admin portal. |
| Provisioning | USB NFC writer (NDEF) at front desk | Physical tap maps to guest assignment; simple and reliable |
| Zuroy Portal | Separate app (Zuroy team only) | Fleet + partner management, separate from hotel operations |
| Zuroy Connect | Next.js | Hotel staff webapp. Consistent with existing skills |
| Zuroy Go | React Native | Guest app. JS/TS shared knowledge, good NFC plugin ecosystem |
| Zuroy Grow | Next.js (Phase 3) | Partner self-service portal. Deferred. |
| Backend | NestJS + PostgreSQL + Prisma | Same as StockFlow, proven patterns |
| Door locks | Phase 2 via Seam API | MVP focuses on guest phone experience |
| Lock vendors to evaluate | Salto KS, Dormakaba Confidant | REST APIs, Seam integration, mid-market pricing |
| Repo structure | New monorepo (pnpm workspace) | apps/api, apps/web, apps/admin, apps/mobile, packages/ |
| Target hotel size | All sizes (5-room to 100+) | Multi-property from day 1 |
| Service menu | Customizable per hotel | Each property configures its own services/items |
| Guest auth | NFC provisioning = auth | Physical possession of provisioned phone = authorization |
| Checkout purge | App data wipe only | Clear guest config, service history, cached data. App stays installed. |
| Purge trigger | Auto at checkout time + manual staff trigger | Both: scheduled auto-purge + staff override via webapp |
| Offline mode | Not needed (always online) | WiFi/cellular assumed available |
| i18n | Full internationalization from start | Multi-language guest UI built in from day 1 |
| Android devices | Bulk Android 9+ with NFC | Samsung Galaxy A-series or similar |
| Payments (guest app) | Charge to room — no in-app payment | All service orders billed to room. Guest settles at checkout via hotel's own POS. |
| Checkout payment | Hotel's existing POS/payment system | Zuroy tracks charges only. No payment processing in Zuroy. |
| NFC for payments | No | NFC card reading for payments violates PCI DSS, Stripe TOS, and card network rules. Not viable on consumer phones. |
| Amenity map | Google Maps satellite view | GPS pins for each amenity. Tap pin → detail card. "Get Directions" for walking nav. |
| Amenity categories | Predefined full set, hide empty | 11 categories covering full resort scope. Empty categories auto-hidden per hotel. |
| Amenity actions | View + navigate (no inline booking) | Info display + walking directions. No ordering/booking from amenity detail view. |
| Partners program | Zuroy-level (not hotel-specific) | External businesses (car rental, tours, restaurants, shops, etc.) listed as Zuroy partners. Revenue stream via paid placements. |
| Partner visibility | Radius-based (100km default) | All partners are global but filtered by proximity to guest's hotel. 100km default radius. |
| Partner management (MVP) | Zuroy admin manages all | Admin creates/edits partner listings. Partner self-service portal deferred to later phase. |
| Boosted partners | Carousel, 3-6 cards, per region | Admin sets featured/boosted partners per region. Horizontal scrollable carousel on guest app dashboard. Paid placement. |
| Partner categories | Reuse amenity-style views | Category view, map view, detail view — same UX pattern as hotel amenities. |

## MVP Scope

### Zuroy Portal (Internal — Zuroy Team)
- Hotel onboarding: create hotel, configure branding (logo, colors, background)
- Device fleet management: register phones, assign to hotels, view status (online/offline/assigned/unassigned)
- Remote device actions: wipe, push app updates
- Device health monitoring: battery, connectivity, app version, last seen
- Usage analytics: check-ins per hotel, service request volumes
- Firmware/OS version tracking
- **Partners program management**: CRUD partner listings (name, description, photos, hours, GPS coordinates, category, contact info, website). Assign to categories: Car Rentals, Tours & Activities, Restaurants, Spas & Wellness, Shopping & Souvenirs, Delicacy Stores, Nightlife, Cultural Sites, Transportation, Other.
- **Boosted partners**: set featured/preferred partners per hotel region. Configurable placement on guest app dashboard. Paid placement tracking.

### Zuroy Connect (Hotel Staff — Front Desk)
- Room management (types, numbers, floors)
- Guest check-in: create reservation → assign room → NFC provision phone
- Guest checkout: trigger app data purge (manual button)
- Auto-purge scheduling: fires at reservation checkout time
- View/manage incoming service requests
- **Amenity management**: CRUD amenities per hotel — name, description, photos, hours, GPS coordinates, category. Assign to predefined categories.
- **Stay extension requests**: view pending requests, approve (updates checkout date + reschedules auto-purge) or reject with reason
- Room charge summary: view itemized charges per guest/room for checkout billing
- Dashboard with occupancy overview
- USB NFC writer integration (write NDEF provisioning tokens)

### Zuroy Go (Guest — Android Phone)
- MDM kiosk mode: fullscreen, no Android UI visible
- Hotel-branded UI: logo, colors, background loaded from API based on assigned hotel
- NFC listener: reads NDEF provisioning token on tap
- Fetches guest config from API using token
- Welcome screen: guest name, room number, checkout date
- Service ordering: room service, housekeeping, maintenance, spa — all charges billed to room
- **Stay extension request**: guest picks extra nights or a new checkout date. Sees request status (pending/approved/rejected with reason). Push notification on status change.
- **Amenities explorer** (two views):
  - **Category view**: browse amenities by category → tap category → list of amenities → tap amenity → detail view
  - **Map view**: Google Maps satellite view with amenity pins at GPS coordinates. Tap pin → detail card (like Google Maps location card).
  - **Detail view**: name, description, photos, opening/closing hours, location on map, "Get Directions" (walking directions via Google Maps)
  - Empty categories auto-hidden
  - Categories: Dining, Pools & Beach, Spa & Wellness, Fitness & Gym, Recreation & Activities, Business Center, Kids & Family, Shopping & Retail, Transport, Guest Services, Events & Entertainment
- **Partners directory** (same UX pattern as amenities):
  - **Category view**: browse external partners by category → list → detail view
  - **Map view**: Google Maps with partner pins (radius-filtered, 100km default from hotel)
  - **Detail view**: name, description, photos, hours, location, contact, website, "Get Directions"
  - Categories: Car Rentals, Tours & Activities, Restaurants, Spas & Wellness, Shopping & Souvenirs, Delicacy Stores, Nightlife, Cultural Sites, Transportation, Other
  - Empty categories auto-hidden
- **Dashboard — Boosted Partners carousel**: horizontal scrollable carousel of 3-6 featured partner cards, set by Zuroy admin per hotel region. Tap card → partner detail view.
- Hotel info: WiFi credentials, local recommendations
- **Checkout purge**: wipes all guest data on command from backend or at scheduled checkout time
- Full i18n (multi-language guest UI)

### Zuroy API (Backend)
- Auth (JWT, three role tiers: Zuroy super-admin, hotel admin/staff, device)
- Multi-property tenancy
- Hotel management + branding configuration
- Device registry: phone enrollment, hotel assignment, status tracking
- Rooms, guests, reservations CRUD
- Provisioning token generation + validation
- Service catalog management (customizable per hotel)
- Service request lifecycle (create → acknowledge → in-progress → complete)
- Room charge ledger: track all guest charges per stay (for hotel's checkout billing)
- Amenity catalog: CRUD amenities with categories, hours, GPS coords, photos. Serve to guest app with category filtering.
- Partner catalog: CRUD partners (Zuroy-level, not hotel-specific). Radius-based filtering (100km default) by hotel GPS. Category filtering.
- Boosted partners: per-region featured partner config. Served to guest app dashboard.
- Stay extension workflow: guest request → staff approve/reject with reason → update checkout date + reschedule auto-purge → push notification to guest
- Checkout purge: send wipe command (manual + scheduled)
- MDM integration: Android Enterprise API for kiosk policy, remote wipe, OTA
- Device health ingestion (periodic heartbeat from guest app)

## Future Phases

### Phase 2: Door Locks
- Integrate Seam API for unified lock management
- Evaluate Salto KS or Dormakaba Confidant
- Guest phone acts as room key via NFC HCE (React Native native module)
- Google Wallet hotel keys as alternative delivery
- Budget 4-8 weeks for vendor onboarding/NDA process

### Phase 3: Zuroy Grow (Partner Self-Service Portal)
- Partners get their own login to manage listings, upload photos, update hours
- Analytics dashboard: views, clicks, "Get Directions" taps
- Billing/subscription management for boosted placements
- Next.js app (apps/grow/)

## Architecture

```
[Zuroy Portal]                          [Zuroy Connect]
  (fleet, partners, branding)            (reservations, check-in/out)
         |                                      |
         v                                      v
    [Zuroy API] <------ shared backend -------->+
         |                                      |
         v                                      v
    [PostgreSQL]              [USB NFC Writer] --NDEF--> [Android Phone]
         |                                                     |
         v                                                     v
    [Android Enterprise MDM]                         [Zuroy Go]
      - Kiosk lockdown                           - Hotel branding (from API)
      - Remote wipe                              - Guest welcome + services
      - OTA updates                              - NFC provisioning listener
      - Device health                            - Partners directory + map
                                                 - i18n, checkout purge
         |
         v (phase 2)                    [Zuroy Grow] (phase 3)
    [Seam API] → [NFC Door Locks]         - Partner self-service
```

## Monorepo Structure

```
zuroy/
├── apps/
│   ├── api/          # Zuroy API — NestJS backend (shared by all frontends)
│   ├── portal/       # Zuroy Portal — Next.js admin (internal)
│   ├── connect/      # Zuroy Connect — Next.js hotel staff webapp
│   ├── go/           # Zuroy Go — React Native guest app (Android)
│   └── grow/         # Zuroy Grow — Next.js partner portal (Phase 3)
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── ui/           # Shared UI components (portal + connect)
│   └── shared/       # Shared types, utils
```

## Hardware Requirements

| Item | Purpose | Example |
|---|---|---|
| USB NFC Writer | Front desk provisioning | ACR122U (~$30) |
| Bulk Android phones | Guest devices | Samsung Galaxy A-series, Android 9+ with NFC |
| Front desk PC/laptop | Runs hotel staff webapp | Any modern browser |

## Open Questions

*All resolved — ready for planning.*
