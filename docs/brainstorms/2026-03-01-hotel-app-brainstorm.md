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
6. Staff enables hotspot on the phone (auto-generated SSID + password)
7. Phone now shows: hotel-branded welcome screen, room info, hotspot credentials, service ordering
8. At checkout, guest returns phone → hotspot disabled, app data purged (auto at checkout time + manual staff trigger)
9. Phone is ready for next guest (app stays installed, hotspot off, all guest data wiped)

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
| MDM provider | AMAPI direct (day 1) | Free, full REST API, Zuroy qualifies as commercial EMM. Apply for EMM partnership early. Fallback: Headwind MDM. |
| Guest checkout wipe | AMAPI `CLEAR_APP_DATA` | Wipes app data only, no factory reset. Phone stays enrolled and ready. |
| Custom boot screen | No (deprioritized) | Guest rarely reboots. In-app branding is sufficient. |
| Hotel branding | In-app, loaded from API per hotel | Logo, colors, background customized per hotel. Managed via admin portal. |
| Provisioning | USB NFC writer (NDEF) at front desk | Physical tap maps to guest assignment; simple and reliable |
| Zuroy Portal | Next.js (App Router) + MUI + Tailwind | Internal admin webapp. Same stack as Algonitiv ERP. |
| Zuroy Connect | Next.js (App Router) + MUI + Tailwind | Hotel staff webapp. Same stack as Algonitiv ERP. |
| Zuroy Go | Expo + React Native | Guest app (Android). Expo for dev tooling, EAS for builds. |
| Zuroy Grow | Next.js (Phase 3) | Partner self-service portal. Deferred. |
| Backend | NestJS (TypeScript) | REST API, modular architecture, same as Algonitiv ERP |
| Database | PostgreSQL + Prisma | Type-safe ORM, shared schema in packages/database |
| Cache / Queue | Redis + BullMQ | JWT blacklist, caching, guaranteed event delivery with DLQ |
| Auth | JWT + RBAC | 3 role tiers: super-admin, hotel staff, device. Redis token blacklist. |
| Email | SendGrid | Transactional emails (alerts, notifications) |
| Monorepo | Turborepo | Simpler than Nx, proven in ERP project |
| UI (web) | MUI + Tailwind CSS | MUI components + Tailwind for layout/spacing |
| Testing (web) | Vitest + Playwright | Unit/integration + E2E for web apps |
| Testing (mobile) | Vitest + Detox | Unit via React Native Testing Library. E2E via Detox (Android emulator). |
| Test coverage | 100% across all apps | CI blocks merge if any app drops below 100%. No exceptions. |
| Deployment | Docker + DigitalOcean + Terraform + GitHub Actions | Same infra pattern as Algonitiv ERP |
| Door locks | Phase 2 via Seam API | MVP focuses on guest phone experience |
| Lock vendors to evaluate | Salto KS, Dormakaba Confidant | REST APIs, Seam integration, mid-market pricing |
| Repo structure | Turborepo monorepo | apps/api, apps/portal, apps/connect, apps/go, packages/* |
| Target hotel size | All sizes (5-room to 100+) | Multi-property from day 1 |
| Service menu | Customizable per hotel | Each property configures its own services/items |
| Guest auth | NFC provisioning = auth | Physical possession of provisioned phone = authorization |
| Checkout purge | App data wipe only | Clear guest config, service history, cached data. App stays installed. |
| Purge trigger | Auto at checkout time + manual staff trigger | Both: scheduled auto-purge + staff override via webapp |
| Connectivity | 5G/LTE SIM in each device | Primary internet via cellular. Hotspot shares this connection with guest's personal devices. |
| Guest hotspot | Staff-enabled at check-in | Auto-generated SSID + password per guest. Shown on welcome screen. Disabled at checkout. |
| Hotspot data limit | Configurable per hotel | Hotel sets daily/stay data cap. Hotspot disabled + guest notified when limit reached. |
| Offline mode | Not needed (always online) | Cellular SIM ensures always-on connectivity. |
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
- **Hotspot management**: enable hotspot during check-in provisioning. View/disable hotspot per device. Configure data limits per hotel.

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
- **Hotspot info**: welcome screen shows auto-generated SSID + password. Guest connects personal devices (laptop, tablet, etc.). Data usage indicator visible in app. Notification when data limit reached + hotspot disabled.
- Hotel info: local recommendations
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
- **Hotspot management**: generate unique SSID/password per provisioning, configure data limits per hotel, track data usage per device/guest, disable hotspot when limit reached + push notification, disable hotspot on checkout purge

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

## Tech Stack

Same stack as Algonitiv ERP — shared knowledge, proven patterns.

| Layer | Technology | Notes |
|---|---|---|
| **Backend** | NestJS (TypeScript) | Modular architecture, REST API, guards/interceptors |
| **Web apps** | Next.js (App Router, TypeScript) | Portal + Connect + Grow |
| **Mobile** | Expo + React Native | Zuroy Go (Android). Expo for dev tooling, EAS for builds. |
| **Database** | PostgreSQL + Prisma | Type-safe ORM, shared schema in `packages/database` |
| **Cache** | Redis | API caching, JWT token blacklist, refresh tokens |
| **Queue** | BullMQ (Redis-backed) | Guaranteed event delivery, 3 retries, DLQ, Bull Board UI |
| **UI (web)** | MUI + Tailwind CSS | MUI components + Tailwind for layout/spacing/colors |
| **Auth** | JWT + RBAC | 3 tiers: super-admin, hotel staff, device. Redis blacklist. |
| **Email** | SendGrid | Transactional emails (alerts, notifications) |
| **Monorepo** | Turborepo | Build orchestration, caching, task pipelines |
| **Testing (web)** | Vitest + Playwright | Unit/integration + E2E for web apps |
| **Testing (mobile)** | Vitest + Detox | Unit via React Native Testing Library. E2E via Detox (Android emulator). |
| **Test coverage** | 100% all apps | API, Portal, Connect, Go. CI blocks merge if below 100%. |
| **Deployment** | Docker + DigitalOcean + Terraform | Docker Compose (dev), Terraform (prod), GitHub Actions (CI/CD) |
| **Validation** | Zod or class-validator | Shared schemas between frontend + backend |
| **Audit** | Generic audit service | All mutations logged: actor, action, entity, before/after diff |

## Architecture

```
[Zuroy Portal]                          [Zuroy Connect]
  Next.js + MUI + Tailwind               Next.js + MUI + Tailwind
  (fleet, partners, branding)            (reservations, check-in/out)
         |                                      |
         v                                      v
    [Zuroy API — NestJS] <-- shared REST API -->+
         |         |                            |
         v         v                            v
  [PostgreSQL] [Redis+BullMQ]   [USB NFC Writer] --NDEF--> [Android Phone]
         |                                                     |
         v                                                     v
    [AMAPI]                                          [Zuroy Go]
      - Kiosk lockdown                           Expo + React Native
      - Remote wipe / CLEAR_APP_DATA             - Hotel branding (from API)
      - OTA via managed Google Play              - Guest welcome + services
      - Device telemetry                         - NFC provisioning listener
                                                 - Hotspot (5G/LTE SIM)
                                                 - Partners directory + map
                                                 - i18n, checkout purge
         |
         v (phase 2)                    [Zuroy Grow] (phase 3)
    [Seam API] → [NFC Door Locks]         Next.js — Partner self-service
```

## Monorepo Structure

```
zuroy/
├── apps/
│   ├── api/          # Zuroy API — NestJS backend (shared by all frontends)
│   ├── portal/       # Zuroy Portal — Next.js admin (internal)
│   ├── connect/      # Zuroy Connect — Next.js hotel staff webapp
│   ├── go/           # Zuroy Go — Expo + React Native guest app (Android)
│   └── grow/         # Zuroy Grow — Next.js partner portal (Phase 3)
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── ui/           # Shared MUI components (portal + connect)
│   └── shared/       # Shared types, DTOs, validation, constants
├── infra/            # Terraform + Dockerfiles
├── turbo.json        # Turborepo pipeline config
└── docker-compose.yml # Local dev (PostgreSQL, Redis, API, web apps)
```

## Hardware Requirements

| Item | Purpose | Example |
|---|---|---|
| USB NFC Writer | Front desk provisioning | ACR122U (~$30) |
| Bulk Android phones | Guest devices | Samsung Galaxy A-series, Android 9+ with NFC |
| Front desk PC/laptop | Runs hotel staff webapp | Any modern browser |

## Android Management API (AMAPI) — Device Fleet Management

### What is AMAPI

Google's free REST API for enterprise Android device management. Not to be confused with Google Endpoint Management (GEM), which is a Workspace-only product that lacks device owner mode. AMAPI is the underlying API that powers third-party EMMs like Esper, Scalefusion, etc.

- **Cost:** Free. No per-device fees. No Google Workspace requirement.
- **Default quota:** 500 devices per project (can request increase from Android Enterprise team)
- **Rate limit:** 1,000 requests per 100 seconds
- **Auth:** Google service account (OAuth2)
- **Base URL:** `https://androidmanagement.googleapis.com/v1/`

### Permissible Usage — Zuroy Qualifies

Google's AMAPI terms prohibit "solutions developed and used exclusively for first party in-house applications." However, Zuroy qualifies as a **commercial EMM**:

- Zuroy manages devices **for hotel customers** (external end customers) ✅
- Hotels are end customers, Zuroy is the EMM provider ✅
- Zuroy has direct agreements with hotels ✅
- It's a commercial SaaS platform, not an internal-only tool ✅

The prohibition targets companies managing only their own internal fleet (warehouse scanners, etc.). Zuroy is a SaaS product serving hotel customers — textbook commercial EMM.

**Action items:**
1. Apply for [Android Enterprise EMM partnership](https://emm.androidenterprise.dev/s/) early (free, no cost)
2. Create a GCP project, try the AMAPI, get a Project ID
3. Register at Partner Portal → "Apply for communities" → paste Project ID
4. Build on AMAPI from day 1
5. **Fallback if denied:** Headwind MDM (open-source, self-hosted, free)

### Kiosk Mode (Dedicated Device Lockdown)

AMAPI supports `installType: "KIOSK"` which auto-launches a single app fullscreen on boot. All escape routes can be disabled via policy:

- Safe boot, factory reset, nav bar, status bar, settings access, camera, app install/uninstall — all lockable
- Guest never sees stock Android UI — only Zuroy Go
- Policy is JSON-based, applied per device or per enrollment token

**How this maps to Zuroy:** Each hotel gets a policy with Zuroy Go as the kiosk app. Policy applied at enrollment time via token. Zuroy Portal creates/manages policies via AMAPI REST calls.

### Remote Wipe — Two Options

| Command | What it does | Use case |
|---|---|---|
| `RESET_PASSWORD` + factory reset | Full device wipe, re-enrollment needed | Lost/stolen device |
| **`CLEAR_APP_DATA`** | Wipes only app data, device stays enrolled, app stays installed | **Guest checkout** |

`CLEAR_APP_DATA` is exactly what Zuroy needs. Clears Zuroy Go's guest data (name, room, service history, cached config) without factory resetting. Phone is immediately ready for next guest. Requires Android 9+.

**How this maps to Zuroy:** At checkout (manual staff trigger or auto-purge), Zuroy API calls AMAPI `devices.issueCommand` with `CLEAR_APP_DATA`. Phone resets to "awaiting provisioning" state. NFC tap at next check-in re-provisions it.

### OTA App Updates (Silent)

Publish Zuroy Go as a **private app on managed Google Play** (free, ~10 min publish time). Set `autoUpdateMode: "AUTO_UPDATE_HIGH_PRIORITY"` in the policy. Updates push silently to all enrolled devices — no user interaction needed.

**How this maps to Zuroy:** Deploy new Zuroy Go versions by publishing to managed Google Play. All hotel devices auto-update. Zuroy Portal can track which devices have which app version via telemetry.

### Device Health / Telemetry

AMAPI exposes rich telemetry via `GET /devices/{id}`:

| Data | Available |
|---|---|
| Last seen time | Yes |
| Battery level / power events | Yes |
| Hardware temperatures | Yes |
| Memory / storage usage | Yes |
| Network info (WiFi/cellular) | Yes |
| Installed app versions | Yes |
| App events (install/update/remove) | Yes |
| Security posture | Yes |
| Policy compliance status | Yes |

Enable via `statusReportingSettings` in the device policy.

**How this maps to Zuroy:** Zuroy Portal fleet health dashboard pulls from AMAPI telemetry. Device health heartbeat in Zuroy Go is supplementary — AMAPI already provides most of what's needed.

### Device Enrollment (50-500 phones)

**QR code enrollment** is the practical path:
1. Create a reusable enrollment token via AMAPI (includes policy, WiFi config)
2. Generate QR code from the token
3. Factory reset each phone → scan QR on setup screen
4. Phone auto-enrolls, installs Zuroy Go, locks to kiosk mode
5. ~3-5 min per device, assembly-line style

**Zero-touch enrollment** (better at scale 500+): Requires purchasing devices from authorized resellers who pre-register them. Phones auto-enroll on first boot with no manual steps.

### No Native Device Groups

AMAPI has no group/OU concept. Device-to-hotel mapping lives in Zuroy's own database. AMAPI is the enforcement layer only — Zuroy Portal is the management layer.

### NFC Provisioning is Separate

The NFC tap at check-in (USB writer → phone) is entirely app-level logic in Zuroy Go. AMAPI handles device enrollment and policy enforcement. These are two separate concerns:

| Concern | Handled by |
|---|---|
| Device enrollment, kiosk lock, remote wipe, OTA | AMAPI |
| Guest provisioning (NFC tap → fetch config) | Zuroy Go app + Zuroy API |

### Decision

**AMAPI direct from day 1.** Free, full REST API, rich telemetry, kiosk mode, `CLEAR_APP_DATA` for guest checkout. Zuroy Portal integrates AMAPI for all fleet management. Apply for EMM partnership early. Fallback: Headwind MDM (open-source, self-hosted).

## Open Questions

- `CLEAR_APP_DATA` latency — how fast does the wipe command execute on-device?
- Should Zuroy subscribe to AMAPI Pub/Sub for enrollment/compliance events vs polling?
- Max 2 GCP projects per developer — sufficient for prod + staging?
