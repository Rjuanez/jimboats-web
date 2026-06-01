# Booking Payment Plan

> File name: `booking-payment-plan.vobj.md`

## Purpose

Represents how a booking is paid.

For the first release, every activity uses the configured online deposit and
the remaining amount is paid in cash on the boat.

## Value

- `depositAmount`: configured `Money`, launch value is `100 EUR`.
- `remainingAmount`: `Money`, derived from total minus deposit.
- `remainingPaymentMethod`: expected to be `CASH_ON_BOARD`.
- `confirmationTrigger`: expected to be `DEPOSIT_PAID`.
- `depositPaymentMode`: online provider for public checkout, or manual when
  marked paid from backpanel.

## Creation Rules

- Launch deposit amount is `100 EUR` for all activities.
- Deposit amount is business configuration and should be managed from the
  backpanel.
- Total amount must be greater than or equal to the deposit amount.
- Remaining amount equals total amount minus deposit amount.
- Remaining payment method must be explicit.
- A booking can be confirmed when the deposit payment succeeds.
- A backpanel booking can be confirmed when the deposit is marked as manually
  paid.

## Normalization

- Amount normalization is delegated to `Money`.
- Payment method and confirmation trigger are stored as uppercase enum-like
  values.

## Equality

Two booking payment plans are equal when deposit amount, remaining amount,
remaining payment method, confirmation trigger, and deposit payment mode are
equal.

## Domain Errors

- `BookingPaymentPlanInvalid`
- `BookingDepositAmountInvalid`
- `BookingRemainingAmountInvalid`
- `BookingManualDepositInvalid`

## Open Questions

- Should manual deposit payment require a receipt note or staff confirmation
  note?
