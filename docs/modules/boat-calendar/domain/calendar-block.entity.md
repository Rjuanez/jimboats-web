# Calendar Block

> File name: `calendar-block.entity.md`

## Purpose

Represents a concrete time range during which the only boat is not available.

This is the authority for availability. A selected slot in a booking is the
customer-facing chosen time range; a calendar block is the operational lock that
prevents another booking or manual block from overlapping the same boat.

## Identity

- `calendarBlockId`: stable internal identifier.

## Attributes

- `source`: why the block exists.
- `status`: active, released, expired, or cancelled.
- `serviceTimeRange`: customer-facing outing `TimeRange`.
- `protectedTimeRange`: canonical `TimeRange` that blocks the boat and includes
  required buffer when applicable.
- `localDate`: `LocalDate` for display and search.
- `timeZone`: `TimeZone` used to derive the local date and times.
- `bookingId`: present when the block belongs to a booking hold or confirmed
  booking.
- `manualReason`: present when the block was created manually from the
  backpanel.
- `expiresAt`: present for checkout holds.
- `createdBy`: visitor, system, or backpanel user that created the block.

## Invariants

- There is only one boat.
- A new `ACTIVE` protected range must not overlap any other `ACTIVE` protected
  range.
- Overlap means `new.startAt < existing.endAt` and
  `existing.startAt < new.endAt`.
- `serviceTimeRange` must satisfy `TimeRange`.
- `protectedTimeRange` must satisfy `TimeRange`.
- Booking-related blocks must include the configured buffer in their protected
  range.
- `BOOKING_HOLD` blocks must have `bookingId` and `expiresAt`.
- `BOOKING_CONFIRMED` blocks must have `bookingId`.
- `MANUAL_BLOCK` blocks must have a manual reason.
- An expired, released, or cancelled block does not protect availability.

## State

- `ACTIVE`: blocks the boat.
- `RELEASED`: manually or system released and no longer blocks the boat.
- `EXPIRED`: checkout hold expired and no longer blocks the boat.
- `CANCELLED`: related booking or operational block was cancelled.

## Behavior

- Create active block if no active protected-range overlap exists.
- Expire a checkout hold.
- Release a manual block.
- Cancel a booking-related block.
- Promote a booking hold into a confirmed booking block after successful deposit
  payment.

## Relationships

- `Booking`: may own the business reservation linked to the block.
- `SelectedSlot`: should match the booking-facing time range.
- `Experience`: influences duration and candidate slots through slot policy.
- `TimeRange`: centralizes range validity and overlap rules.
- `BookingAvailabilityPolicy`: supplies the `30` minute buffer and advance
  window rules.
- `LocalDate`: stores the business date.
- `TimeZone`: stores the business time zone.

## Domain Errors

- `CalendarBlockOverlap`
- `CalendarBlockInvalidRange`
- `CalendarBlockCannotBeReleased`
- `CalendarBlockAlreadyInactive`
- `CalendarBlockHoldExpired`
- `CalendarBlockBufferInvalid`

## Open Questions

- Should a manual block be allowed to partially overlap an expired hold before a
  cleanup job has marked it expired?
