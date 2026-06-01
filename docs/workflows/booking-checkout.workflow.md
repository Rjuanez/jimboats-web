# Booking Checkout

> File name: `booking-checkout.workflow.md`

## Purpose

Describe the cross-module flow for buying an experience with extras, protecting
the only boat, taking the online deposit, giving the buyer access to their
booking, and sending notifications.

## Participating Modules

- Experience Catalog
- Boat Calendar
- Booking
- Notifications
- Localization SEO

## Trigger

A public visitor chooses an experience, selected slot, extras, and buyer
details, then starts checkout.

## Steps

1. Experience Catalog loads the selected published experience.
2. Experience Catalog validates selected extras against the experience.
3. Experience Catalog validates the selected slot against the experience
   `SlotPolicy`.
4. Booking validates selected extras, including quantity, experience, slot, and
   minimum notice rules.
5. Booking creates a `PriceSnapshot` with total amount, online deposit amount,
   and remaining cash-on-board amount.
6. Booking creates a `BookingPaymentPlan` with `100 EUR` deposit and
   `CASH_ON_BOARD` remaining payment method.
7. Boat Calendar attempts to create an active `CalendarBlock` with source
   `BOOKING_HOLD`.
8. Boat Calendar expands the protected range with the required booking buffer.
9. Boat Calendar rejects the flow if the protected range overlaps another
   active `CalendarBlock`.
10. Booking creates a `Booking` in `PENDING_PAYMENT`.
11. Booking creates `BookingAccess` with a public reference and secure token
    metadata.
12. Booking creates or prepares a `PaymentRecord` for the deposit amount only
    and starts provider checkout.
13. Payment provider confirms deposit payment through a trusted event.
14. Booking verifies payment amount and currency against the deposit amount.
15. Booking moves to `CONFIRMED`.
16. Boat Calendar keeps the linked protected block active as the confirmed boat
    reservation.
17. Notifications creates and sends booking confirmation messages that explain
    deposit paid and remaining amount due in cash on board.

## Failure And Compensation

- If calendar block creation fails because of overlap, no booking is created.
- If deposit checkout cannot start, the calendar block must be released or
  expired.
- If deposit payment fails, booking moves to `PAYMENT_FAILED` and the block
  becomes inactive.
- If deposit payment does not complete before hold expiration, booking moves to
  `EXPIRED` and the block becomes inactive.
- If confirmation notification fails, the booking remains confirmed and the
  notification records failure for retry.

## Consistency Rules

- `CreateBookingHold` is the authoritative moment for overlap validation.
- Public availability shown before checkout is advisory.
- No two active protected calendar blocks can overlap because there is only one
  boat.
- Booking confirmation must be idempotent for payment provider retries.
- Price, deposit, and remaining cash-on-board amount must be frozen in the
  booking before the buyer enters payment.
- Public checkout pays only the `100 EUR` deposit.
- Public checkout hold lasts `15` minutes.
- Remaining amount is paid in cash on board.
- Maximum advance booking window is `6` months.
- Minimum advance booking window is `1` hour.
- Launch buyer notification channels are email and WhatsApp.
- Public self-service reschedule is not supported; date and time changes happen
  from the backpanel.

## Events

- `BookingHoldCreated`
- `BookingHoldExpired`
- `BookingDepositPaymentSucceeded`
- `BookingConfirmedDepositPaid`
- `BookingPaymentFailed`
- `BookingCancelled`
- `BookingNotificationRequested`

## SEO And GEO Impact

- Checkout, payment return, and buyer booking access pages are not indexable.
- Public experience pages remain the SEO and GEO entry points.
- Buyer-facing transactional content must use the buyer's locale and avoid
  silent fallback for critical booking information.

## Open Questions

- Which cancellation policy tiers and deposit outcomes should be configured at
  launch?
