# Backpanel Cancel Booking

> File name: `backpanel-cancel-booking.use-case.md`

## Purpose

Allow staff to cancel a confirmed booking from the backpanel and release its
calendar block.

## Implementation Status

Implemented in the admin bookings v2 slice.

The current implementation marks the booking as `CANCELLED`, sets
`cancelledAt`, and releases the associated `BOOKING_CONFIRMED` calendar block in
one persistence operation. It also records a `BOOKING_CANCELLED` audit entry and
stores `BookingCancelled` in the outbox.

Cancellation policy tiers, refund work, notifications, and outbox publishing are
intentionally outside this slice.

## Actor

- `ADMIN` backpanel user.
- `STAFF` backpanel user.

## Command Or Query

- `bookingId`: booking to cancel.
- `cancelledBy`: backpanel user cancelling the booking.

## Response

- Updated booking DTO with `CANCELLED` status.
- Existing calendar block id remains attached to the booking for traceability.

## Ports

- `BookingRepository`
- `Clock`

## Rules

- Only confirmed bookings can be cancelled in this slice.
- Already cancelled bookings return a controlled application error.
- Pending payment, expired, or failed bookings are not handled by this admin
  cancellation path yet.
- Cancelling the booking releases the active booking calendar block.
- Deposit refund outcome is not decided here.

## Side Effects

- Updates booking status and `cancelledAt`.
- Updates calendar block status to `RELEASED`.
- Records `BOOKING_CANCELLED` audit data.
- Stores `BookingCancelled` in the outbox.

## Application Errors

- `BOOKING_NOT_FOUND`
- `BOOKING_ALREADY_CANCELLED`
- `BOOKING_NOT_EDITABLE`

## SEO And GEO Impact

- No direct SEO or GEO impact.
- Buyer access pages remain non-indexable when implemented.
