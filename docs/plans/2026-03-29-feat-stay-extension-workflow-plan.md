---
title: Stay Extension Workflow
type: feat
date: 2026-03-29
---

# Stay Extension Workflow

## Overview

Guest requests late checkout / extra nights via Go app. Staff reviews in Connect, approves (updates checkout date + reschedules auto-purge) or rejects with reason. Guest sees status update.

## New Prisma Model

```prisma
model StayExtension {
  id            String              @id @default(cuid())
  reservationId String
  reservation   Reservation         @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  hotelId       String
  hotel         Hotel               @relation(fields: [hotelId], references: [id], onDelete: Restrict)
  newCheckOut   DateTime
  reason        String?
  status        StayExtensionStatus @default(PENDING)
  rejectionNote String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([hotelId, status])
  @@index([reservationId])
}

enum StayExtensionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

Add `stayExtensions StayExtension[]` to Hotel and Reservation models.

## API Endpoints

- [ ] `POST /v1/hotels/:hotelId/reservations/:reservationId/extensions` — guest creates request (newCheckOut date, optional reason)
- [ ] `GET /v1/hotels/:hotelId/extensions` — staff views pending requests
- [ ] `GET /v1/hotels/:hotelId/reservations/:reservationId/extensions` — list extensions for a reservation
- [ ] `POST /v1/hotels/:hotelId/extensions/:id/approve` — staff approves (updates reservation.checkOut, reschedules auto-purge)
- [ ] `POST /v1/hotels/:hotelId/extensions/:id/reject` — staff rejects with note

## Connect UI

- [ ] `(dashboard)/extensions/page.tsx` — pending extension requests list
- [ ] Approve/Reject buttons with rejection note dialog
- [ ] Add "Extensions" to sidebar nav

## Go App UI

- [ ] `(tabs)/services/extend.tsx` — form to request extension (date picker, reason)
- [ ] Show extension status on home screen if pending/approved/rejected

## Acceptance Criteria

- [ ] Guest can request checkout extension
- [ ] Staff sees pending requests in Connect
- [ ] Approve updates checkout date + reschedules BullMQ purge job
- [ ] Reject includes a note visible to guest
- [ ] Only CHECKED_IN reservations can request extensions
