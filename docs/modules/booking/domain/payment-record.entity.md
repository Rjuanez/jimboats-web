# Payment Record

> File name: `payment-record.entity.md`

## Purpose

Tracks payment state for a booking while keeping the domain independent from
Stripe or any future payment provider.

## Identity

- `paymentRecordId`: stable internal identifier.

## Attributes

- `bookingId`: booking being paid.
- `status`: pending, succeeded, manually paid, failed, cancelled, refunded, or
  partially refunded.
- `amount`: online `Money` expected or paid. For launch this is the deposit
  amount, not the full booking total.
- `currency`: `CurrencyCode`.
- `provider`: payment provider name, or manual source when the deposit is marked
  paid from the backpanel.
- `providerSessionId`: checkout session reference when available.
- `providerPaymentIntentId`: payment intent reference when available.
- `failureReason`: provider or business failure reason.
- `paidAt`: when deposit payment succeeded.
- `createdAt`: when payment record was created.

## Invariants

- A payment record belongs to exactly one booking.
- A successful public checkout payment amount must match the booking deposit
  amount unless an explicit adjustment exists.
- Provider references are external identifiers and must not be used as domain
  identity.
- A booking cannot be confirmed from a failed payment record.
- A manual deposit payment can be recorded from the backpanel without an
  external provider reference.

## State

- `PENDING`: provider checkout has been prepared or is in progress.
- `SUCCEEDED`: online deposit payment completed successfully.
- `MANUALLY_PAID`: deposit was marked as paid from the backpanel.
- `FAILED`: deposit payment failed.
- `CANCELLED`: checkout was cancelled.
- `REFUNDED`: full refund completed.
- `PARTIALLY_REFUNDED`: partial refund completed.

## Behavior

- Start provider checkout for a booking.
- Mark deposit payment as successful from a trusted provider event.
- Mark deposit payment as manually paid from the backpanel.
- Mark payment as failed or cancelled.
- Record refund state when refunds are supported.

## Relationships

- `Booking`: payment confirmation can move the booking to `CONFIRMED`.
- `PriceSnapshot`: expected amount and currency.
- `BookingPaymentPlan`: defines that the provider charges the deposit only.
- `Money`: represents expected, paid, and refund amounts.
- `CurrencyCode`: protects supported payment currencies.

## Domain Errors

- `PaymentAmountMismatch`
- `PaymentCannotConfirmBooking`
- `ManualDepositPaymentInvalid`
- `PaymentAlreadyFinalized`
- `PaymentProviderReferenceMissing`

## Open Questions

- Which refund states are required for the first public version?
