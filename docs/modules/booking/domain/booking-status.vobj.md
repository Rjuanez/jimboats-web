# Booking Status

> File name: `booking-status.vobj.md`

## Purpose

Represents the lifecycle state of a booking.

## Value

- `PENDING_PAYMENT`: checkout hold exists and payment has not succeeded.
- `CONFIRMED`: deposit payment succeeded or a valid backpanel override
  confirmed the reservation.
- `EXPIRED`: checkout hold expired before deposit payment succeeded.
- `PAYMENT_FAILED`: deposit payment failed.
- `CANCELLED`: booking was cancelled after creation.

## Creation Rules

- A new public checkout booking starts as `PENDING_PAYMENT`.
- `CONFIRMED` requires successful deposit payment or explicit backpanel
  override.
- `EXPIRED`, `PAYMENT_FAILED`, and `CANCELLED` are terminal for the first
  version unless a recovery flow is defined.

## Normalization

- Stored as uppercase enum-like values.

## Equality

Two booking statuses are equal when their status value is equal.

## Domain Errors

- `InvalidBookingStatus`
- `InvalidBookingStatusTransition`

## Open Questions

- Do we need `RESCHEDULED` or should rescheduling create a new selected slot
  while preserving `CONFIRMED`?
