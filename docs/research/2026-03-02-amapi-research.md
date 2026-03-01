# Android Management API (AMAPI) — Research for Zuroy

**Date:** 2026-03-02
**Context:** Zuroy manages a fleet of dedicated Android phones locked to a single guest app (Zuroy Go) in hotel settings. This research evaluates AMAPI as the long-term MDM backend replacing Esper.

---

## Table of Contents

1. [Summary & Viability](#1-summary--viability)
2. [Cost & Licensing](#2-cost--licensing)
3. [Permissible Usage — CRITICAL ISSUE](#3-permissible-usage--critical-issue)
4. [REST API Specifics](#4-rest-api-specifics)
5. [Dedicated Device / Kiosk Mode](#5-dedicated-device--kiosk-mode)
6. [Remote Wipe](#6-remote-wipe)
7. [OTA App Updates & Managed Google Play](#7-ota-app-updates--managed-google-play)
8. [Device Health / Telemetry](#8-device-health--telemetry)
9. [Bulk Enrollment](#9-bulk-enrollment)
10. [Policy Management](#10-policy-management)
11. [Provisioning Tokens](#11-provisioning-tokens)
12. [Device Groups](#12-device-groups)
13. [Zuroy-Specific Implementation Notes](#13-zuroy-specific-implementation-notes)
14. [AMAPI vs Esper Comparison](#14-amapi-vs-esper-comparison)
15. [Recommendation](#15-recommendation)

---

## 1. Summary & Viability

**What AMAPI is:** A free REST API from Google for building Enterprise Mobility Management (EMM) solutions. It manages Android devices via JSON-based policies. A companion app (Android Device Policy) enforces policies on-device — no native Android development required.

**What it supports:**
- Fully managed devices (company-owned, full control)
- Dedicated devices (single-purpose kiosk mode) — this is the Zuroy use case
- Work profiles (BYOD) — not relevant to Zuroy

**Key advantage:** No per-device cost. Full programmatic control via REST API. Kiosk mode, remote wipe, OTA updates, telemetry all built in.

**Key risk:** Permissible usage restrictions (see Section 3).

---

## 2. Cost & Licensing

| Item | Cost |
|---|---|
| AMAPI itself | **Free** |
| Android Device Policy app | Free (auto-installed during enrollment) |
| Managed Google Play | Free |
| Private app hosting | Free (no $25 Play Console fee when published via managed Google Play iframe) |
| Google Cloud project | Free (API calls within quota) |
| Google Workspace | **Not required** |

**Quotas:**
- Default: **500 devices** per project (hard-enforced)
- Exceeding 500: requires formal application to Android Enterprise team via [response form](https://goo.gle/android-enterprise-response)
- API rate limit: 1,000 requests per 100 seconds per project
- Maximum 2 projects per developer

**Bottom line:** AMAPI is genuinely free with no per-device licensing. The cost is engineering time to integrate.

---

## 3. Permissible Usage — CRITICAL ISSUE

**Who can use AMAPI (per Google's policy):**
1. Commercial EMM developers (building MDM solutions sold to external customers)
2. Device Trust solution providers (IDPs, MTDs, EDRs, SIEM)
3. OEMs (for enterprise features only)

**Explicitly prohibited:**
- "Solutions developed and used exclusively for first party in-house applications"
- Device financing solutions
- User monitoring/surveillance tools
- Pushing apps without user consent

**What this means for Zuroy:**

Zuroy is a SaaS platform managing devices **for hotel customers** (not purely internal). This is a gray area:

- **Argument FOR permissibility:** Zuroy is building a commercial EMM-like solution sold to hotels. Hotels are external customers. Zuroy manages devices on their behalf. This aligns with "commercial EMM developer" use case.
- **Argument AGAINST:** Zuroy owns the devices. Zuroy is the EMM and the end-user. Google may view this as first-party use disguised as a commercial product.

**Mitigation paths:**
1. **Apply for Android Enterprise partnership** — register as an EMM provider, validate the solution for "commercial availability." If approved, quota lifts to negotiated limits and permissible use is cleared.
2. **Structure Zuroy as a device-management SaaS** — hotels are the "customers," Zuroy is the "EMM provider." This is arguably what Zuroy already is.
3. **Use Esper for MVP, migrate later** — Esper is itself built on AMAPI and is an approved EMM partner. Using Esper initially avoids the permissible-use question entirely.

**Recommendation:** Start with Esper (as planned in brainstorm). In parallel, apply for Android Enterprise EMM partnership. If approved, migrate to direct AMAPI integration. If denied, Esper at ~$2/device/mo is still viable.

---

## 4. REST API Specifics

### Base URL

```
https://androidmanagement.googleapis.com/v1
```

### Authentication

- **Method:** Google Cloud service account with OAuth 2.0
- **IAM Role:** `Android Management User` (`roles/androidmanagement.user`)
- **Permission:** `androidmanagement.enterprises.manage`
- **Key type:** JSON service account key (downloaded from Google Cloud Console)

### Setup Steps

1. Create Google Cloud project
2. Enable "Android Management API" in API Library
3. Create service account (Credentials > Service account key)
4. Assign `Android Management User` role in IAM
5. Download JSON key file — store securely
6. Use key to obtain OAuth 2.0 access tokens for API calls

### Key Endpoints

| Resource | Method | Endpoint | Purpose |
|---|---|---|---|
| **Enterprises** | POST | `/v1/enterprises` | Create enterprise binding |
| | GET | `/v1/{name=enterprises/*}` | Get enterprise |
| **Policies** | PATCH | `/v1/{name=enterprises/*/policies/*}` | Create or update policy |
| | GET | `/v1/{name=enterprises/*/policies/*}` | Get policy |
| | DELETE | `/v1/{name=enterprises/*/policies/*}` | Delete policy |
| **Enrollment Tokens** | POST | `/v1/{parent=enterprises/*}/enrollmentTokens` | Create enrollment token |
| | GET | `/v1/{name=enterprises/*/enrollmentTokens/*}` | Get token |
| | LIST | `/v1/{parent=enterprises/*}/enrollmentTokens` | List tokens |
| | DELETE | `/v1/{name=enterprises/*/enrollmentTokens/*}` | Revoke token |
| **Devices** | GET | `/v1/{name=enterprises/*/devices/*}` | Get device details + telemetry |
| | LIST | `/v1/{parent=enterprises/*}/devices` | List all devices |
| | PATCH | `/v1/{name=enterprises/*/devices/*}` | Update device (change policy, etc.) |
| | DELETE | `/v1/{name=enterprises/*/devices/*}` | Unenroll/delete device |
| | POST | `/v1/{name=enterprises/*/devices/*}:issueCommand` | Remote wipe, lock, reboot, clear app data |
| **Applications** | GET | `/v1/{name=enterprises/*/applications/*}` | Get app metadata + tracks |
| **Web Apps** | POST | `/v1/{parent=enterprises/*}/webApps` | Create web app |
| **Web Tokens** | POST | `/v1/{parent=enterprises/*}/webTokens` | Token for managed Google Play iframe |

### Client Libraries

Official libraries: Java, .NET, Python, Ruby. No official Node.js library — use REST directly or `googleapis` npm package.

---

## 5. Dedicated Device / Kiosk Mode

This is the core Zuroy use case: lock an Android phone to Zuroy Go so the guest sees nothing else.

### Single-App Kiosk Mode

Set the app's `installType` to `"KIOSK"` in the policy. The app:
- Launches automatically on boot
- Runs fullscreen
- Is pinned (user cannot exit)
- Only **one** app per device can be `KIOSK`

### Full Kiosk Policy (Zuroy Go)

```json
{
  "name": "enterprises/ENTERPRISE_ID/policies/zuroy-hotel-kiosk",

  "applications": [
    {
      "packageName": "com.zuroy.go",
      "installType": "KIOSK",
      "autoUpdateMode": "AUTO_UPDATE_HIGH_PRIORITY",
      "defaultPermissionPolicy": "GRANT"
    }
  ],

  "kioskCustomization": {
    "powerButtonActions": "POWER_BUTTON_AVAILABLE",
    "systemErrorWarnings": "ERROR_AND_WARNINGS_MUTED",
    "systemNavigation": "NAVIGATION_DISABLED",
    "statusBar": "NOTIFICATIONS_AND_SYSTEM_INFO_DISABLED",
    "deviceSettings": "SETTINGS_ACCESS_BLOCKED"
  },

  "keyguardDisabled": true,
  "safeBootDisabled": true,
  "screenCaptureDisabled": true,
  "factoryResetDisabled": true,
  "cameraDisabled": true,
  "addUserDisabled": true,
  "installAppsDisabled": true,
  "uninstallAppsDisabled": true,
  "modifyAccountsDisabled": true,
  "networkResetDisabled": true,

  "systemUpdate": {
    "type": "WINDOWED",
    "startMinutes": 180,
    "endMinutes": 300
  },

  "statusReportingSettings": {
    "applicationReportsEnabled": true,
    "deviceSettingsEnabled": true,
    "softwareInfoEnabled": true,
    "memoryInfoEnabled": true,
    "networkInfoEnabled": true,
    "displayInfoEnabled": true,
    "powerManagementEventsEnabled": true,
    "hardwareStatusEnabled": true,
    "systemPropertiesEnabled": true,
    "applicationReportingSettings": {
      "includeRemovedApps": true
    }
  },

  "maximumTimeToLock": 0,
  "locationMode": "LOCATION_ENFORCED"
}
```

### Key Kiosk Fields Explained

| Field | Purpose | Zuroy Value |
|---|---|---|
| `installType: "KIOSK"` | Locks device to this single app | Set on Zuroy Go |
| `kioskCustomization.systemNavigation` | Hide nav bar | `NAVIGATION_DISABLED` |
| `kioskCustomization.statusBar` | Hide status bar | `NOTIFICATIONS_AND_SYSTEM_INFO_DISABLED` |
| `kioskCustomization.deviceSettings` | Block settings access | `SETTINGS_ACCESS_BLOCKED` |
| `keyguardDisabled` | No lock screen | `true` (guest device, no PIN) |
| `safeBootDisabled` | Prevent safe boot escape | `true` |
| `factoryResetDisabled` | Prevent guest factory reset | `true` |
| `maximumTimeToLock: 0` | Never auto-lock | Keeps app always visible |

### Multi-App Kiosk (Not Needed for Zuroy)

If multiple apps needed: set `kioskCustomLauncherEnabled: true` and add multiple apps with `installType: "FORCE_INSTALLED"`. Zuroy only needs single-app mode.

---

## 6. Remote Wipe

### Full Device Wipe (Factory Reset)

```http
POST https://androidmanagement.googleapis.com/v1/enterprises/{enterpriseId}/devices/{deviceId}:issueCommand

{
  "type": "RESET_PASSWORD"
}
```

Wait — the actual wipe command:

```http
POST /v1/{name=enterprises/*/devices/*}:issueCommand

{
  "type": "WIPE",
  "wipeParams": {
    "wipeDataFlags": ["WIPE_EXTERNAL_STORAGE"]
  }
}
```

**WIPE command:** Factory resets the device. For company-owned fully managed devices, this erases everything. The device must be re-enrolled after wipe.

### App Data Wipe Only (CLEAR_APP_DATA) — Zuroy Checkout Flow

```http
POST /v1/enterprises/{enterpriseId}/devices/{deviceId}:issueCommand

{
  "type": "CLEAR_APP_DATA",
  "clearAppsDataParams": {
    "packageNames": ["com.zuroy.go"]
  }
}
```

**This is the Zuroy checkout wipe.** Clears Zuroy Go's app data (guest config, cached data, service history) without factory resetting the device. The app stays installed and ready for the next guest.

**Requirements:**
- Android 9+ required
- Only clears standard app data directory
- External storage data is NOT cleared by this command
- Returns per-package status: `SUCCESS`, `APP_NOT_FOUND`, `APP_PROTECTED`, `API_LEVEL`

**Response status mapping:**

```json
{
  "clearAppsDataStatus": {
    "results": {
      "com.zuroy.go": {
        "result": "SUCCESS"
      }
    }
  }
}
```

### Other Commands

| Command | Use | Android Version |
|---|---|---|
| `LOCK` | Lock device screen | All |
| `REBOOT` | Restart device | 7.0+ |
| `RESET_PASSWORD` | Reset device password | All |
| `START_LOST_MODE` | Show custom message + location tracking | Fully managed |
| `STOP_LOST_MODE` | Exit lost mode | Fully managed |

### Zuroy Wipe Strategy

| Scenario | Command | Effect |
|---|---|---|
| Guest checkout (normal) | `CLEAR_APP_DATA` | Wipes guest data, app stays installed, ready for next guest |
| Lost/stolen device | `WIPE` | Full factory reset |
| Device decommission | `DELETE` (device resource) | Unenrolls + wipes |

---

## 7. OTA App Updates & Managed Google Play

### How Private App Distribution Works

1. **Publish Zuroy Go as a private app** via the managed Google Play iframe (embedded in Zuroy Portal)
2. No $25 Google Play Console fee when publishing through managed Google Play iframe
3. App publishes in ~10 minutes (vs 2 hours via standard Play Console)
4. App is **never publicly visible** — only available to the enterprise's managed devices

### Silent Auto-Updates

Set `autoUpdateMode` in the policy's application entry:

```json
{
  "packageName": "com.zuroy.go",
  "installType": "KIOSK",
  "autoUpdateMode": "AUTO_UPDATE_HIGH_PRIORITY"
}
```

| Mode | Behavior |
|---|---|
| `AUTO_UPDATE_DEFAULT` | Updates when device is on Wi-Fi, charging, idle, not in foreground |
| `AUTO_UPDATE_POSTPONED` | Delays updates up to 90 days |
| `AUTO_UPDATE_HIGH_PRIORITY` | Updates ASAP, restarts app if running |

**For Zuroy:** Use `AUTO_UPDATE_HIGH_PRIORITY`. When you push a new APK to managed Google Play, all enrolled devices update automatically without any user interaction.

### Closed Testing Tracks

For staged rollouts:
1. Create a closed test track in Google Play Console
2. Get track IDs via `enterprises.applications` GET endpoint
3. Add `accessibleTrackIds` to policy:

```json
{
  "packageName": "com.zuroy.go",
  "installType": "KIOSK",
  "accessibleTrackIds": ["closed-track-id"],
  "autoUpdateMode": "AUTO_UPDATE_HIGH_PRIORITY"
}
```

Use this to test new Zuroy Go versions on a subset of hotel devices before full rollout.

### Update Flow for Zuroy

1. Build new Zuroy Go APK/AAB
2. Upload to managed Google Play (via iframe or Play Console)
3. Wait ~10 min for publishing
4. Devices with `AUTO_UPDATE_HIGH_PRIORITY` pull the update silently
5. Kiosk app restarts with new version
6. Monitor via `applicationReports[].versionCode` in device telemetry

---

## 8. Device Health / Telemetry

AMAPI exposes rich telemetry per device via `GET /v1/enterprises/{id}/devices/{deviceId}`.

### Available Telemetry Fields

| Category | Fields | Notes |
|---|---|---|
| **Last seen** | `lastStatusReportTime`, `lastPolicySyncTime` | Timestamps of last device check-in |
| **Battery & power** | `powerManagementEvents[]` | Battery/thermal events chronologically |
| **Hardware temps** | `hardwareStatusSamples[]` | CPU, GPU, battery, skin temps (requires `hardwareStatusEnabled: true` in policy) |
| **Memory/storage** | `memoryInfo.totalRam`, `memoryInfo.totalInternalStorage` | Plus `memoryEvents[]` for tracking |
| **Display** | `displays[]` | Resolution, state (ON/OFF/DOZE), refresh rate |
| **Network** | `networkInfo` | Telephony + connectivity details |
| **Software** | `softwareInfo.androidVersion`, `softwareInfo.securityPatchLevel`, `softwareInfo.systemUpdateInfo` | Pending update status |
| **Hardware** | `hardwareInfo.brand`, `hardwareInfo.model`, `hardwareInfo.serialNumber` | Device identity |
| **App versions** | `applicationReports[].versionCode`, `applicationReports[].versionName` | Per-app version tracking |
| **App events** | `applicationReports[].events[]` | Install/update/remove events (30-hour window) |
| **App states** | `applicationReports[].keyedAppStates[]` | Custom app-reported status with severity |
| **Policy compliance** | `policyCompliant`, `nonComplianceDetails[]` | Boolean + detailed reasons |
| **Security** | `securityPosture`, `deviceSettings.encryptionStatus` | Security posture assessment |
| **Device state** | `state` | ACTIVE, DISABLED, DELETED, PROVISIONING, LOST |

### Enabling Telemetry in Policy

Add `statusReportingSettings` to your policy (included in the kiosk policy example above):

```json
"statusReportingSettings": {
  "applicationReportsEnabled": true,
  "deviceSettingsEnabled": true,
  "softwareInfoEnabled": true,
  "memoryInfoEnabled": true,
  "networkInfoEnabled": true,
  "displayInfoEnabled": true,
  "powerManagementEventsEnabled": true,
  "hardwareStatusEnabled": true
}
```

### Zuroy Portal Telemetry Dashboard

Map AMAPI fields to Zuroy Portal dashboard:

| Portal Display | AMAPI Source |
|---|---|
| "Last seen" | `lastStatusReportTime` |
| "Battery level" | `powerManagementEvents[]` (latest event) |
| "Online/offline" | Derive from `lastStatusReportTime` (e.g., >15 min = offline) |
| "App version" | `applicationReports[].versionCode` where `packageName == "com.zuroy.go"` |
| "OS version" | `softwareInfo.androidVersion` |
| "Security patch" | `softwareInfo.securityPatchLevel` |
| "Storage" | `memoryInfo.totalInternalStorage` |
| "Compliance" | `policyCompliant` |
| "Pending update" | `softwareInfo.systemUpdateInfo` |

### Custom App States (Keyed App States)

Zuroy Go can report custom telemetry back to AMAPI:

```kotlin
// In Zuroy Go (React Native native module)
val keyedAppState = KeyedAppState.builder()
    .setKey("guest_provisioned")
    .setSeverity(KeyedAppState.SEVERITY_INFO)
    .setMessage("Guest: John Doe, Room: 402")
    .build()
```

These appear in `applicationReports[].keyedAppStates[]` — useful for Zuroy Portal to see which device is assigned to which guest without hitting the Zuroy API.

---

## 9. Bulk Enrollment

### Method 1: QR Code Provisioning (Recommended for Zuroy MVP)

**Works on:** Android 7.0+

**Flow:**
1. Zuroy Portal creates an enrollment token via API:

```http
POST /v1/enterprises/{enterpriseId}/enrollmentTokens

{
  "policyName": "enterprises/{enterpriseId}/policies/zuroy-hotel-kiosk",
  "allowPersonalUsage": "PERSONAL_USAGE_DISALLOWED_USERLESS",
  "duration": "86400s"
}
```

2. Response includes a `qrCode` field (JSON string for QR encoding)
3. Zuroy Portal displays QR code
4. On a factory-reset phone, tap screen 6 times to open QR scanner
5. Scan QR code — device downloads Android Device Policy, enrolls, applies policy, installs Zuroy Go
6. Device is ready

**Batch process for 50-500 devices:**
- Create one enrollment token (reusable across multiple devices)
- Set long `duration` (e.g., `"604800s"` = 7 days)
- Print QR code or display on screen
- Assembly-line: factory reset each phone, scan QR, set aside
- ~3-5 min per device (mostly waiting for download/install)

### Method 2: Zero-Touch Enrollment (Recommended for Scale)

**Works on:** Android 8.0+ (Pixel 7.1+)

**How it works:**
1. Purchase devices from an **authorized zero-touch reseller** (e.g., Samsung, Ingram Micro, ScanSource)
2. Reseller assigns devices to your zero-touch enrollment account (by serial/IMEI)
3. In the zero-touch enrollment portal, create a configuration pointing to your AMAPI enterprise
4. When devices power on for the first time, they **automatically** enroll — no manual intervention

**Advantages:**
- True zero-touch: device arrives, power on, it's managed
- Scales to thousands of devices
- No physical access needed after purchase

**Disadvantages:**
- Must buy from authorized resellers (limits device choice)
- Requires portal setup
- Not available in all countries

### Method 3: NFC Bump (Android 6.0+)

Requires an NFC programmer device. Less practical than QR for bulk.

### Method 4: Enrollment Token Link

URL format: `https://enterprise.google.com/android/enroll?et=<token>`

Open on device browser to trigger enrollment. Useful for remote provisioning.

### Enrollment Token Details

| Parameter | Purpose | Example |
|---|---|---|
| `policyName` | Policy applied at enrollment | `enterprises/{id}/policies/zuroy-hotel-kiosk` |
| `allowPersonalUsage` | Device ownership mode | `PERSONAL_USAGE_DISALLOWED_USERLESS` |
| `duration` | Token expiry | `"604800s"` (7 days) |
| `oneTimeOnly` | Single-use token | `false` (reuse for batch) |

**Critical:** If a device enrolls without a valid policy, it enters **quarantine** — all functions blocked. If no policy within 5 minutes, the device factory resets itself.

---

## 10. Policy Management

### How Policies Work

- Policies are JSON resources stored under an enterprise
- Named: `enterprises/{enterpriseId}/policies/{policyId}`
- A device has exactly **one** active policy at a time
- Updating a policy auto-propagates to all devices using it
- Unused policies (no device or token reference) auto-deleted after 7 days

### Create/Update a Policy

```http
PATCH /v1/enterprises/{enterpriseId}/policies/zuroy-hotel-kiosk

{
  "applications": [...],
  "kioskCustomization": {...},
  ...
}
```

Uses `PATCH` for both create and update. The policy ID is in the URL path.

### Switch a Device to a Different Policy

```http
PATCH /v1/enterprises/{enterpriseId}/devices/{deviceId}

{
  "policyName": "enterprises/{enterpriseId}/policies/zuroy-hotel-premium"
}
```

### Default Policy

Name a policy `"default"` — it applies to any newly enrolled device that doesn't specify a `policyName` in its enrollment token.

### Policy-Per-Hotel Strategy for Zuroy

Two approaches:

**Option A: One policy per hotel**
```
enterprises/{id}/policies/hotel-marriott-sf
enterprises/{id}/policies/hotel-hilton-nyc
enterprises/{id}/policies/hotel-hyatt-miami
```
- Pro: granular control per property
- Con: many policies to manage, policy drift

**Option B: Shared policy + app-level config (Recommended)**
```
enterprises/{id}/policies/zuroy-hotel-kiosk  (one policy for all hotels)
```
- Hotel-specific config (branding, services) managed at the **app level** via Zuroy API
- AMAPI policy only handles device lockdown (same for all hotels)
- Pro: single policy to maintain, app handles differentiation
- Con: can't customize device-level settings per hotel

**Recommendation:** Option B. The AMAPI policy controls device lockdown (identical across all hotels). Hotel-specific customization (branding, services, room config) handled by Zuroy Go fetching config from Zuroy API. Only create separate policies if a hotel needs different device-level settings (e.g., camera enabled for one hotel).

---

## 11. Provisioning Tokens

### What They Are

Enrollment tokens are credentials that trigger device enrollment into an enterprise with a specific policy. They encode all info needed for provisioning into a QR code or URL.

### Creating a Token

```http
POST /v1/enterprises/{enterpriseId}/enrollmentTokens

{
  "policyName": "enterprises/{enterpriseId}/policies/zuroy-hotel-kiosk",
  "allowPersonalUsage": "PERSONAL_USAGE_DISALLOWED_USERLESS",
  "duration": "3600s"
}
```

### Response

```json
{
  "name": "enterprises/{enterpriseId}/enrollmentTokens/{tokenId}",
  "value": "ABCDEF123456...",
  "qrCode": "{\"android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME\":\"...\", ...}",
  "expirationTimestamp": "2026-03-02T13:00:00Z",
  "policyName": "enterprises/{enterpriseId}/policies/zuroy-hotel-kiosk",
  "allowPersonalUsage": "PERSONAL_USAGE_DISALLOWED_USERLESS"
}
```

### Key Parameters

| Field | Default | Max | Notes |
|---|---|---|---|
| `duration` | 1 hour | ~10,000 years | Set long for batch enrollment |
| `allowPersonalUsage` | — | — | `PERSONAL_USAGE_DISALLOWED_USERLESS` for dedicated devices |
| `policyName` | — | — | Required; policy applied at enrollment |
| `oneTimeOnly` | false | — | If true, token can only be used once |

### Token Lifecycle

1. Created via API
2. Encoded as QR code or URL
3. Device scans/opens it
4. Android Device Policy downloads and installs
5. Device enrolls into enterprise
6. Policy applies, apps install
7. Token can be reused (unless `oneTimeOnly: true`)
8. Token expires after `duration`

### Zuroy Portal Integration

Zuroy Portal should have a "Provision Devices" page that:
1. Calls `enrollmentTokens.create` with the kiosk policy
2. Renders the `qrCode` value as a scannable QR
3. Staff scans with factory-reset phones
4. Portal monitors `devices.list` for new enrollments

---

## 12. Device Groups

**AMAPI does not have a native "device group" concept.** There are no organizational units, folders, or group resources in the API.

### How to Achieve Grouping

**Method 1: Multiple policies (one per group)**
- Create `policies/hotel-a`, `policies/hotel-b`
- Assign devices to the appropriate policy
- Policy = implicit group membership

**Method 2: Application-level grouping (Recommended for Zuroy)**
- Single AMAPI policy for all devices
- Zuroy API maintains device-to-hotel mappings
- Zuroy Portal queries its own DB for "devices at Hotel X"
- AMAPI is just the enforcement layer

**Method 3: Multiple enterprises**
- Create separate enterprises per hotel or region
- Provides complete isolation
- Overkill for Zuroy — adds complexity

**Method 4: Cloud Pub/Sub + metadata**
- Subscribe to enrollment notifications
- Tag devices in your own system upon enrollment
- Use device names/IDs as foreign keys in Zuroy DB

### Zuroy Approach

Zuroy already tracks device-to-hotel assignments in its own database. AMAPI just needs to:
- Enroll devices
- Apply the kiosk policy
- Respond to wipe/update commands

Grouping logic lives in Zuroy Portal, not AMAPI.

---

## 13. Zuroy-Specific Implementation Notes

### Guest Checkout Wipe Flow

```
1. Staff clicks "Checkout" in Zuroy Connect
2. Zuroy API marks reservation as checked-out
3. Zuroy API calls AMAPI: issueCommand(CLEAR_APP_DATA, ["com.zuroy.go"])
4. Device's Zuroy Go app data is wiped
5. Zuroy Go detects empty state, shows "Ready for next guest" screen
6. Device stays enrolled, app stays installed, policy stays applied
```

### Auto-Purge at Scheduled Checkout

```
1. Zuroy API cron job checks for reservations past checkout time
2. For each expired reservation, calls AMAPI CLEAR_APP_DATA
3. Also notifies Zuroy Go via push notification to reset UI
```

### Device Enrollment Flow (New Device)

```
1. Zuroy team receives new bulk Android phones
2. In Zuroy Portal, generate enrollment QR code (one token, reusable)
3. Factory reset each phone
4. Tap screen 6x → scan QR
5. Phone auto-enrolls, installs Zuroy Go
6. In Zuroy Portal, assign device to a hotel
7. Ship phone to hotel
```

### NFC Guest Provisioning (Separate from AMAPI)

NFC provisioning (tap phone on USB writer at check-in) is **not an AMAPI feature**. It's handled entirely in the Zuroy Go app:
1. Zuroy Go listens for NFC/NDEF
2. Reads provisioning token from NFC tag
3. Calls Zuroy API with token to fetch guest config
4. Displays hotel-branded guest UI

AMAPI handles device-level management. NFC provisioning is app-level logic.

---

## 14. AMAPI vs Esper Comparison

| Capability | AMAPI Direct | Esper |
|---|---|---|
| **Cost** | Free | Free tier → ~$2/device/mo |
| **Kiosk mode** | Yes (KIOSK installType) | Yes (purpose-built) |
| **Remote wipe** | Yes (WIPE + CLEAR_APP_DATA) | Yes |
| **App data wipe only** | Yes (CLEAR_APP_DATA) | Yes |
| **OTA app updates** | Yes (managed Google Play) | Yes (Esper cloud) |
| **Telemetry** | Rich (battery, network, app versions, etc.) | Rich (better dashboard) |
| **Device groups** | No native groups | Yes (groups + blueprints) |
| **Enrollment** | QR code, zero-touch | QR code, zero-touch, template |
| **Dashboard** | Build your own | Ready-made console |
| **API quality** | REST, well-documented | REST, well-documented |
| **Permissible use** | Gray area for Zuroy | No restrictions |
| **Dev effort** | High (build all UI + logic) | Low (use Esper console + API) |
| **Vendor lock-in** | Google (Android-native) | Esper (third-party) |
| **Private apps** | Managed Google Play | Esper cloud upload |

---

## 15. Recommendation

### MVP (Phase 1): Use Esper

- Fastest path to working MDM
- No permissible usage risk
- Ready-made dashboard for fleet management
- Good API for Zuroy Portal integration
- Free tier sufficient for prototyping
- Purpose-built for dedicated Android devices

### Long-term (Phase 2+): Evaluate AMAPI Direct

- Apply for Android Enterprise EMM partnership in parallel
- If approved: migrate MDM logic from Esper to direct AMAPI
- Eliminates per-device cost at scale (50-500+ devices)
- Full control over enrollment, policies, and telemetry
- Build MDM features directly into Zuroy Portal

### If AMAPI is Not Permissible

- Esper at ~$2/device/mo for 500 devices = ~$1,000/mo
- Acceptable cost for the value provided
- Alternative: Headwind MDM (open-source, self-hosted, free)
  - Docker-deployable
  - Kiosk mode support
  - Remote wipe
  - Less polished but zero cost
  - Community: https://h-mdm.com/

---

## References

- [AMAPI Overview](https://developers.google.com/android/management)
- [Dedicated Devices Policy](https://developers.google.com/android/management/policies/dedicated-devices)
- [REST API Reference](https://developers.google.com/android/management/reference/rest)
- [Device Resource](https://developers.google.com/android/management/reference/rest/v1/enterprises.devices)
- [Issue Command](https://developers.google.com/android/management/reference/rest/v1/enterprises.devices/issueCommand)
- [Policy Resource](https://developers.google.com/android/management/reference/rest/v1/enterprises.policies)
- [Create Enterprise](https://developers.google.com/android/management/create-enterprise)
- [Create Policy](https://developers.google.com/android/management/create-policy)
- [Provision Device](https://developers.google.com/android/management/provision-device)
- [Service Account Setup](https://developers.google.com/android/management/service-account)
- [App Management](https://developers.google.com/android/management/apps)
- [Permissible Usage](https://developers.google.com/android/management/permissible-usage)
- [Quickstart](https://developers.google.com/android/management/quickstart)
- [AMAPI Quota Changes (Bayton)](https://bayton.org/blog/2024/03/amapi-permissible-usage/)
- [Zero-Touch Enrollment (Admin)](https://support.google.com/work/android/answer/7514005)
- [Zero-Touch Reseller Portal](https://developers.google.com/zero-touch/guides/portal)
- [Headwind MDM (Open Source)](https://h-mdm.com/)
- [Android Enterprise Community: Internal Use Discussion](https://www.androidenterprise.community/discussions/conversations/android-management-api-for-internal-use/10034)
