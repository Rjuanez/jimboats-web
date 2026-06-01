# Confirm Booking Payment

> File name: `confirm-booking-payment.use-case.md`

## Purpose

Confirm a pending booking after a trusted deposit payment success event.

## Actor

- Payment provider webhook.
- Backpanel user with explicit override, if allowed.

## Command Or Query

- `providerEventId`: idempotency key from provider event.
- `providerPaymentReference`: provider payment or checkout reference.
- `bookingId`: booking to confirm when known.

## Response

- `bookingId`: confirmed booking.
- `status`: expected to be `CONFIRMED`.

## Ports

- `BookingRepository`
- `PaymentRecordRepository`
- `CalendarBlockRepository`
- `EventStore` or `DomainEventPublisher`
- `Clock`

## Rules

- Payment event must be trusted and idempotent.
- Payment amount and currency must match the booking deposit amount.
- Booking must be `PENDING_PAYMENT`.
- Related calendar block must still be active and linked to the booking.
- Calendar block source becomes or remains booking-related and protects the
  confirmed booking.

## Side Effects

- Marks deposit payment as succeeded.
- Moves booking to `CONFIRMED`.
- Ensures the calendar block remains active.
- Emits `BookingConfirmedDepositPaid`.

## Application Errors

- `BookingNotFound`
- `PaymentRecordNotFound`
- `PaymentAmountMismatch`
- `BookingCannotBeConfirmed`
- `CalendarBlockMissing`

## SEO And GEO Impact

- No indexable public URL is created.
- Notification content should use the buyer's locale.

## Open Questions

- Should confirmation happen only from webhook, or can return-from-checkout also
  confirm after provider verification?
