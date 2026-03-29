# E2E Browser Tests — Brainstorm

**Date:** 2026-03-29
**Status:** Ready for planning

## What We're Building

Playwright E2E tests for Portal + Connect that drive through the actual browser UI. Minimal seeding: just a SUPER_ADMIN user + one hotel. Everything else (rooms, staff, devices, reservations, check-in/out) created through the UI during tests.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Playwright | CLAUDE.md spec, auto-waiting, multi-browser, trace viewer |
| Scope | Portal + Connect | Full admin + staff workflow |
| Seeding | Admin user + 1 hotel | Minimal DB setup, tests prove UI works end-to-end |
| Test strategy | UI-driven | Create everything through forms, not API calls |
| Test flow | Sequential | Portal creates data → Connect consumes it |

## Test Scenarios

### Portal Tests
1. Login as admin
2. Create hotel (with branding)
3. Create staff user (assigned to hotel)
4. Register device
5. Assign device to hotel
6. Create partner
7. Verify dashboard shows counts

### Connect Tests (using staff user created in Portal)
1. Login as hotel staff
2. Create rooms
3. Create reservation
4. Check-in (assign device, get provisioning token)
5. View service requests
6. Create amenity
7. Check-out

## Open Questions

- Run against dev servers (next dev) or built apps?
- Test database: fresh per run or persistent?
- CI: run in GitHub Actions with postgres service?
