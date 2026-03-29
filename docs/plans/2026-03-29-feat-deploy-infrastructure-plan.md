---
title: Deploy Infrastructure
type: feat
date: 2026-03-29
---

# Deploy Infrastructure

## Overview

Replicate the n-electric deployment pattern for Zuroy. Multi-stage Dockerfiles for API/Portal/Connect, Terraform for DigitalOcean droplet, Caddy reverse proxy with auto TLS, deploy.sh script via GHCR, daily Postgres backups.

## Reference

All patterns adapted from `~/projects/n-software/n-electric/infra/`.

## Implementation Phases

### Phase 1: Dockerfiles

- [ ] `infra/docker/api.Dockerfile` — multi-stage NestJS build (node:20-alpine, yarn, prisma generate, nest build, runs as nestjs user:1001, port 3001, healthcheck /v1/health)
- [ ] `infra/docker/portal.Dockerfile` — multi-stage Next.js build (node:20-alpine, yarn, standalone output, NEXT_PUBLIC_API_URL build arg, runs as nextjs user:1001, port 3000, healthcheck /api/health)
- [ ] `infra/docker/connect.Dockerfile` — same as portal but port 3002, NEXT_PUBLIC_API_URL build arg
- [ ] All builds from repo root (monorepo context), COPY specific app + packages

### Phase 2: Docker Compose (Production)

- [ ] `infra/docker/docker-compose.yml` — 5 services:
  - **caddy**: ports 80/443, reverse proxy to api:3001 + portal:3000 + connect:3002
  - **api**: NestJS, 0.5 CPU / 512M RAM, env vars for DB, JWT, etc.
  - **portal**: Next.js, 0.3 CPU / 256M RAM
  - **connect**: Next.js, 0.3 CPU / 256M RAM
  - **db**: PostgreSQL 16, 0.4 CPU / 512M RAM, persistent volume, healthcheck
- [ ] `infra/docker/Caddyfile` — reverse proxy for api.zuroy.com, portal.zuroy.com, connect.zuroy.com. Security headers (HSTS, X-Content-Type-Options, X-Frame-Options). TLS via Let's Encrypt.
- [ ] `infra/docker/.env.example` — all required env vars with placeholders

### Phase 3: Terraform

- [ ] `infra/terraform/main.tf` — DigitalOcean droplet (s-2vcpu-4gb), Ubuntu 22.04, sgp1, SSH key, firewall (22/80/443), monitoring
- [ ] `infra/terraform/variables.tf` — do_token (sensitive), ssh_public_key
- [ ] `infra/terraform/outputs.tf` — droplet IP
- [ ] `infra/terraform/cloud-init.yaml` — install Docker + Compose V2, create deploy user, create volumes (postgres_data, caddy_data), setup backup cron (daily 3AM pg_dump, 7-day retention), create /opt/zuroy app dir

### Phase 4: Deploy Script

- [ ] `scripts/deploy.sh` — build → push → deploy flow:
  1. Pull latest from main
  2. Login to GHCR
  3. Build all 3 images with `--platform linux/amd64`
  4. Tag with git SHA + latest
  5. Push to ghcr.io/rnadela/zuroy/{api,portal,connect}
  6. SSH to deploy@DROPLET_IP
  7. Pull images, run prisma migrate deploy, docker compose up -d
  8. Health check all 3 services (15s delay)
  9. Rollback on failure
- [ ] Add `"ship": "bash scripts/deploy.sh"` to root package.json

### Phase 5: Local Docker Compose (Dev)

- [ ] Update root `docker-compose.yml` — add API + Portal + Connect services for local Docker dev (optional, `yarn dev` is primary)

## File Structure

```
infra/
├── docker/
│   ├── api.Dockerfile
│   ├── portal.Dockerfile
│   ├── connect.Dockerfile
│   ├── docker-compose.yml
│   ├── Caddyfile
│   └── .env.example
└── terraform/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── cloud-init.yaml
scripts/
└── deploy.sh
```

## Resource Limits (s-2vcpu-4gb droplet)

| Service | CPU | Memory | Port |
|---|---|---|---|
| caddy | 0.1 | 64M | 80, 443 |
| api | 0.5 | 512M | 3001 |
| portal | 0.3 | 256M | 3000 |
| connect | 0.3 | 256M | 3002 |
| db | 0.4 | 512M | 5432 |
| **Total** | **1.6** | **1.6G** | — |

## Acceptance Criteria

- [ ] All 3 Dockerfiles build successfully
- [ ] Docker Compose starts all 5 services
- [ ] Caddy routes to correct upstream by subdomain
- [ ] Terraform provisions droplet with Docker + deploy user
- [ ] deploy.sh builds, pushes, and deploys with health checks
- [ ] Daily backup cron configured
- [ ] Health endpoints accessible: api.zuroy.com/v1/health, portal.zuroy.com, connect.zuroy.com

## Deferred

- GitHub Actions deploy workflow (use manual deploy.sh for now)
- SSL email + domain setup (configure when domain is ready)
- Go app deployment (EAS Build, separate process)
