---
title: Mermaid User Workflow Diagram
type: docs
date: 2026-03-08
---

# Mermaid User Workflow Diagram

Create a Mermaid flowchart of the entire Zuroy user workflow — from hotel onboarding through guest checkout and ongoing monitoring.

## Overview

Convert the existing PlantUML diagram (`docs/diagrams/user-workflow.puml`) into a Mermaid diagram. Mermaid renders natively on GitHub, making it more accessible than PlantUML.

## Source

Existing PlantUML: `docs/diagrams/user-workflow.puml` — covers all 8 phases:

1. Hotel Onboarding (Zuroy Team via Portal)
2. Device Fleet Setup (Zuroy Team + System)
3. Hotel Room Setup (Hotel Staff via Connect)
4. Partners Setup (Zuroy Team via Portal)
5. Guest Check-in (Hotel Staff + NFC provisioning + hotspot)
6. Guest Uses Phone (amenities, services, partners, hotspot, stay extension)
7. Service Request Handling (Hotel Staff)
8. Guest Checkout (auto-purge + manual purge, hotspot disable, data wipe)
9. Ongoing Monitoring (fleet health, OTA updates, remote wipe)

## Acceptance Criteria

- [x] Mermaid flowchart in `docs/diagrams/user-workflow.md`
- [x] All 4 swimlanes: Zuroy Team (Portal), Hotel Staff (Connect), Guest (Go App), System (API + Devices)
- [x] All 8 phases + ongoing monitoring covered
- [x] Decision nodes: stay extension (approve/reject), data limit reached, checkout trigger (auto/manual)
- [x] Fork/parallel paths for guest usage (amenities, services, partners, hotspot, stay extension)
- [x] Renders correctly on GitHub

## MVP

### `docs/diagrams/user-workflow.md`

Single Mermaid flowchart using `flowchart TD` with subgraphs for each swimlane/phase. Key structure:

```
flowchart TD
  subgraph portal["Zuroy Team (Portal)"]
    ...hotel onboarding, device setup, partners...
  end

  subgraph connect["Hotel Staff (Connect)"]
    ...room setup, check-in, service requests, checkout...
  end

  subgraph guest["Guest (Go App)"]
    ...welcome, amenities, services, partners, hotspot...
  end

  subgraph system["System (API + Devices)"]
    ...NFC, provisioning, hotspot gen, purge, MDM...
  end
```

Nodes linked across subgraphs to show cross-actor flows (e.g., staff taps NFC → system provisions → guest sees welcome screen).

## Notes

- Mermaid has no native swimlane support — use subgraphs as visual lanes
- Keep node labels short (2-3 lines max) for readability
- Use different node shapes: `([])` for start/end, `{}` for decisions, `[]` for actions
- Color subgraphs to match the PlantUML theme (green/blue/orange/purple)
