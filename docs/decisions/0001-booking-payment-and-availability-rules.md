# ADR-0001: Booking Payment And Availability Rules

## Status

Accepted

## Context

Booking rules affect payment, availability, buyer messaging, checkout copy,
backpanel operations, and support. They should not be hidden only in interface
text.

## Decision

- Every public booking pays a fixed online deposit of `100 EUR`.
- The remaining amount is paid on the boat in cash.
- A booking is confirmed when the deposit payment succeeds.
- Stripe or another online provider charges only the deposit amount for the
  first release.
- The price snapshot must show total amount, online deposit amount, and cash
  remaining amount.
- Booking checkout uses a hold: `PENDING_PAYMENT` booking plus active calendar
  block while the buyer pays.
- Public checkout hold duration is `15` minutes, aligned with Stripe Checkout
  custom expiration limits.
- Payment confirmation comes from a trusted provider event.
- Date and time changes are allowed only from the backpanel.
- Backpanel date and time changes have no fixed limit, but every change must be
  audited.
- Bookings can be created, modified, and cancelled from the backpanel.
- Backpanel bookings can mark the deposit as manually paid.
- Every booking-related calendar block must enforce a `30` minute buffer between
  boat outings.
- Maximum advance booking window is `6` months.
- Minimum advance booking window is `1` hour.
- Cancellation rules are configurable by time-window tiers before departure.
- Cancellation policy tiers decide deposit outcome, such as refundable, partial,
  non-refundable, or manual review.
- Extra prices are per booking.
- Extra quantities are configurable per experience.
- Extras may require a minimum notice period.
- Extras may depend on experience and selected slot.
- Extras may decrease effective capacity.
- Extras do not increase duration unless a future explicit rule says otherwise.
- Notification channels exist in the domain as email and WhatsApp, but delivery
  providers remain infrastructure concerns.
- Launch buyer notification channels are email and WhatsApp.

## Consequences

- Public checkout copy must clearly state that `100 EUR` is paid online and the
  remaining amount is paid in cash on board.
- Checkout UI should communicate the `15` minute payment hold clearly.
- Booking confirmation means deposit paid, not total paid.
- Refund and cancellation behavior depends on configurable cancellation policy
  tiers.
- Backpanel booking operations need their own detailed use cases.
- Calendar availability must compare protected ranges, not only customer-facing
  outing times.

## Pending Stakeholder Questions

- What initial quantity limits should be configured for each launch extra and
  experience?
- What initial cancellation tiers and deposit outcomes should be configured in
  the backpanel at launch?
- Which launch extras should be configured as slot-dependent?
- Which launch extras should be configured to decrease effective capacity, and
  by how much?
- What initial reminder timings should be configured before departure?

## Alternatives Considered

- Full online payment: postponed because the business wants the remaining amount
  collected on the boat.
- Public self-service reschedule: postponed; reschedules are admin-only for now.
