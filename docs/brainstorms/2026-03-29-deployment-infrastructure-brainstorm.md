# Zuroy Deployment Infrastructure — Brainstorm

**Date:** 2026-03-29
**Status:** Ready for planning

## What We're Building

Replicate the n-electric deployment pattern for Zuroy: multi-stage Dockerfiles, Terraform for DigitalOcean, Caddy reverse proxy, deploy.sh script, daily Postgres backups. Adapted for 4 apps (API, Portal, Connect, Go build server not needed — Expo uses EAS).

## Reference: n-electric Pattern

| Component | n-electric | Zuroy (adapted) |
|---|---|---|
| Dockerfiles | api.Dockerfile, web.Dockerfile | api.Dockerfile, portal.Dockerfile, connect.Dockerfile |
| Docker Compose | caddy + api + web + db | caddy + api + portal + connect + db |
| Terraform | 1 droplet (s-1vcpu-2gb), sgp1 | 1 droplet (s-2vcpu-4gb — more apps), sgp1 |
| Reverse proxy | Caddy with auto TLS | Caddy with auto TLS |
| Deploy script | deploy.sh (build → push GHCR → ssh deploy) | Same pattern |
| Registry | GHCR (ghcr.io/rnadela) | GHCR (ghcr.io/rnadela/zuroy) |
| Backups | Daily pg_dump cron, 7-day retention | Same |
| Go app | N/A | Built via EAS, not Docker |

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Droplet size | s-2vcpu-4gb | 3 containers (api + 2 web) need more RAM than n-electric's 2 |
| Region | sgp1 | Same as n-electric, close to target market |
| Domains | api.zuroy.com, portal.zuroy.com, connect.zuroy.com | Subdomain per app |
| Package manager | yarn (not pnpm) | Zuroy uses yarn v1 |
| Monorepo build | Build from repo root, COPY specific app | Turborepo monorepo needs root context |
| Go app deploy | EAS Build (separate) | Expo/RN doesn't run in Docker |

## Open Questions

- Domain: zuroy.com or different domain? (can set later in Caddyfile)
- SSL email for Let's Encrypt?
- Same DO account as n-electric or separate?
