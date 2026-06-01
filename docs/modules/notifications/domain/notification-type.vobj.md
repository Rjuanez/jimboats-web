# Notification Type

> File name: `notification-type.vobj.md`

## Purpose

Represents the business reason for sending a notification.

## Value

- `BOOKING_HOLD_CREATED`
- `BOOKING_CONFIRMED_DEPOSIT_PAID`
- `BOOKING_PAYMENT_FAILED`
- `BOOKING_EXPIRED`
- `BOOKING_CANCELLED`
- `BOOKING_RESCHEDULED`
- `BOOKING_REMINDER`
- `ADMIN_BOOKING_CREATED`

## Creation Rules

- Type must be one of the supported values.
- Booking-related types must reference a booking.
- Reminder types must have a scheduled send time.
- Admin types can notify staff through supported channels.

## Normalization

- Stored as uppercase enum-like values.

## Equality

Two notification types are equal when their type value is equal.

## Domain Errors

- `NotificationTypeUnsupported`
- `NotificationTypeRequiresBooking`
- `NotificationTypeRequiresSchedule`

## Open Questions

- Which reminder timings are required before departure?
