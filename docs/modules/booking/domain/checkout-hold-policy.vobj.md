# Checkout Hold Policy

> File name: `checkout-hold-policy.vobj.md`

## Purpose

Represents how long a public checkout can hold the selected boat time while the
buyer completes the deposit payment.

## Value

- `holdDurationMinutes`: launch value is `15`.
- `providerConstraint`: payment provider checkout expiration constraint.

## Creation Rules

- Hold duration must be positive.
- Launch hold duration is `15` minutes.
- Hold duration must stay aligned with payment provider checkout expiration.
- When the hold expires, the booking becomes `EXPIRED` and the calendar block no
  longer protects availability.

## Normalization

- Duration is stored in integer minutes.

## Equality

Two checkout hold policies are equal when their hold duration and provider
constraint are equal.

## Domain Errors

- `CheckoutHoldPolicyInvalid`
- `CheckoutHoldProviderConstraintViolated`

## Open Questions

- Should abandoned checkout notifications be sent after hold expiration?
