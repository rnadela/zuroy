# Zuroy Go App Polish — Brainstorm

**Date:** 2026-03-29
**Status:** Ready for planning

## What We're Building

Three polish features for the Zuroy Go Android guest app:

1. **NFC Provisioning** — Replace manual text input with real NFC tap. App listens for NDEF tags, reads provisioning token, auto-provisions.
2. **Dynamic Hotel Branding** — Apply hotel's colors, logo, and background image throughout the app after provisioning. Full theme + background.
3. **App-Level Kiosk Mode** — Hide status bar, disable back button, immersive fullscreen. No MDM needed.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| NFC payload format | Plain text NDEF | Simplest, works with any USB writer, app is always foreground in kiosk mode |
| Branding depth | Full theme + background | Colors + logo + background image on welcome, themed headers/buttons/tabs |
| Kiosk approach | App-level (React Native APIs) | No MDM enrollment needed, works immediately. AMAPI deferred. |
| NFC library | react-native-nfc-manager | Already installed, has Expo config plugin |

## NFC Provisioning Flow

1. App shows "Awaiting Provisioning" screen with NFC icon animation
2. Staff taps phone against USB NFC writer at front desk
3. Writer sends NDEF text record containing the raw provisioning token (64 hex chars)
4. App's NFC listener reads the tag → extracts token string
5. App calls `POST /v1/devices/provision` with the token + device API key
6. API returns guest config (name, room, hotel branding)
7. App transitions to branded welcome screen

**Fallback:** Keep the manual text input as a fallback (e.g., if NFC fails, staff can type/paste the token).

## Dynamic Branding

After provisioning, the app receives hotel config:
- `primaryColor` — tab bar active tint, header background, buttons
- `secondaryColor` — accents, secondary buttons
- `logoUrl` — displayed on welcome screen and info screen
- `backgroundUrl` — full-screen background image on welcome screen

Implementation: React context providing theme colors. All components read from context. Tab navigator re-renders with hotel colors.

## App-Level Kiosk

Using React Native APIs (no MDM):
- `StatusBar.setHidden(true)` — hide status bar
- `NavigationBar.setVisibility('hidden')` — hide Android nav bar (via expo-navigation-bar)
- Immersive sticky mode — fullscreen, bars reappear briefly on swipe then hide
- Disable hardware back button (override `BackHandler`)
- Prevent app switching (limited without MDM — can only discourage, not fully prevent)

**Limitations without MDM:**
- User can still pull down notification shade with effort
- Can't truly lock to single app without device owner mode
- Sufficient for demo/testing, real lockdown needs AMAPI later

## Open Questions

- Should NFC listener run continuously or only on the provisioning screen?
- Device API key storage: AsyncStorage or expo-secure-store?
- Should the app cache hotel branding locally for faster re-display after restart?
