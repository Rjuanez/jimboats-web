# Cancel Booking

> File name: `cancel-booking.use-case.md`

## Purpose

Cancel an existing booking and free or cancel its calendar block according to
business rules.

## Actor

- Backpanel user.
- Buyer self-service flow is not part of the current decision.

## Command Or Query

- `bookingId`: booking to cancel.
- `reason`: cancellation reason.
- `cancelledBy`: actor cancelling the booking.

## Response

- `bookingId`: cancelled booking.
- `status`: expected to be `CANCELLED`.
- `calendarBlockStatus`: resulting calendar block state.
- `depositOutcome`: result from cancellation policy.
- `refundWorkRequired`: whether a refund or manual review must happen.

## Ports

- `BookingRepository`
- `CalendarBlockRepository`
- `PaymentRecordRepository`
- `CancellationPolicyRepository`
- `DomainEventPublisher`
- `Clock`

## Rules

- Confirmed bookings can be cancelled only if cancellation policy allows it.
- Cancellation policy is configurable by hour-based tiers before departure and
  versioned for audit.
- The matching cancellation tier from the booking's policy version decides
  deposit outcome.
- Cancelling a booking must make its calendar block inactive.
- Deposit refund state is handled through payment rules and may be separate from
  booking cancellation.

## Side Effects

- Updates booking status.
- Updates calendar block status.
- Records the policy version and tier used for the cancellation decision.
- May create refund work if needed.
- Emits `BookingCancelled`.

## Application Errors

- `BookingNotFound`
- `BookingCannotBeCancelled`
- `CalendarBlockMissing`
- `CancellationPolicyMissing`
- `CancellationPolicyNotSatisfied`

## SEO And GEO Impact

- Buyer access page remains non-indexable.
- Notification content should use the buyer's locale.

## Open Questions

- What initial cancellation tiers and outcomes should be configured in the
  backpanel at launch?
