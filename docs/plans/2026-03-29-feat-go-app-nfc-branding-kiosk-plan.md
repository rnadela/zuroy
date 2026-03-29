---
title: Go App — NFC Provisioning, Dynamic Branding, Kiosk Mode
type: feat
date: 2026-03-29
---

# Go App — NFC Provisioning, Dynamic Branding, Kiosk Mode

## Overview

Polish the Zuroy Go Android guest app with three features: real NFC tag reading for provisioning, dynamic hotel branding (colors + logo + background), and app-level kiosk mode (hidden bars + disabled back button).

## Implementation Phases

### Phase 1: Kiosk Mode

Hide system UI, disable back button. Apply globally in root layout.

- [ ] Install `expo-navigation-bar`: `npx expo install expo-navigation-bar`
- [ ] Add plugin to `app.json`: `["expo-navigation-bar", { "position": "absolute", "visibility": "hidden", "behavior": "overlay-swipe" }]`
- [ ] Update `app/_layout.tsx`:
  - `StatusBar hidden={true}` (from expo-status-bar)
  - `NavigationBar.setVisibilityAsync('hidden')` + `setBehaviorAsync('overlay-swipe')`
  - `BackHandler.addEventListener('hardwareBackPress', () => true)` — consume all back presses

### Phase 2: Theme Context

Dynamic theming from hotel branding config.

- [ ] Create `src/context/ThemeContext.tsx` — React context with `HotelTheme` type (primary, secondary, logoUrl, backgroundUrl)
- [ ] Default theme: Zuroy blue (#1a56db)
- [ ] `useTheme()` hook for components
- [ ] After provisioning: `setTheme()` with hotel colors from API response
- [ ] Wrap app in `ThemeProvider` in root layout
- [ ] Update `app/(tabs)/_layout.tsx` — read `theme.primary` for tab bar + header colors
- [ ] Update `app/(tabs)/index.tsx` (welcome) — use theme.primary as background, show logoUrl, backgroundUrl as Image
- [ ] Update all screens to read colors from `useTheme()` instead of hardcoded values

### Phase 3: NFC Provisioning

Replace text input with real NFC tag reading.

- [ ] Create `src/lib/nfc.ts` — wrapper around react-native-nfc-manager
  - `initNfc()` — call `NfcManager.start()`
  - `readNdefText()` — `requestTechnology(NfcTech.Ndef)` → `getTag()` → `Ndef.text.decodePayload()` → `cancelTechnologyRequest()`
- [ ] Update `app/provision.tsx`:
  - On mount: call `initNfc()`, then `readNdefText()` in a loop
  - Show animated NFC icon + "Tap phone to provision" message
  - On successful read: call provision API with token
  - Keep text input as fallback (toggle button: "Enter manually")
  - On provision success: `setConfig()` + `setTheme()` → navigate to tabs
- [ ] Call `NfcManager.start()` once in root layout `useEffect`

### Phase 4: Store Persistence

Persist config + theme for app restarts (until checkout wipe).

- [ ] Use `AsyncStorage` to persist guest config + theme after provisioning
- [ ] On app launch: check AsyncStorage for existing config → skip provisioning if found
- [ ] On checkout (CLEAR_APP_DATA from AMAPI): AsyncStorage is wiped → returns to provisioning screen

## Acceptance Criteria

- [ ] Status bar and navigation bar hidden on Android
- [ ] Back button disabled (no app exit)
- [ ] NFC tag with NDEF text record triggers provisioning automatically
- [ ] Manual token input available as fallback
- [ ] Hotel's primaryColor applied to tab bar, headers, buttons
- [ ] Hotel's logo displayed on welcome screen
- [ ] Hotel's backgroundUrl shown as welcome screen background
- [ ] Theme persists across app restarts
- [ ] App reverts to provisioning screen when AsyncStorage is cleared

## Dependencies

- `expo-navigation-bar` — needs install
- `@react-native-async-storage/async-storage` — needs install (or use expo-secure-store)
- `react-native-nfc-manager` — already installed

## Deferred

- AMAPI kiosk policy (hard lock) — requires EMM enrollment
- Enforce 3-button navigation via device policy
- Splash screen with hotel branding
