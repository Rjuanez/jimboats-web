# Booking Availability Policy

> File name: `booking-availability-policy.vobj.md`

## Purpose

Represents configurable booking-window and buffer rules used when checking
whether the only boat can be booked.

## Value

- `maxAdvanceBookingMonths`: maximum future booking window, set to `6`.
- `minAdvanceBookingMinutes`: minimum notice before departure, set to `60`.
- `bufferBetweenOutingsMinutes`: required buffer between boat outings, set to
  `30`.
- `timeZone`: business `TimeZone`, expected to be `Europe/Madrid`.

## Creation Rules

- Maximum advance booking window must be positive.
- Buffer must be non-negative.
- Launch buffer is `30` minutes.
- The protected calendar range expands the customer-facing outing enough to
  keep at least `30` minutes between two active boat outings.
- Launch maximum advance window is `6` months.
- Launch minimum advance booking window is `1` hour.
- These values are business configuration and should be managed from the
  backpanel.

## Normalization

- Months and minutes are stored as integers.
- Time zone normalization is delegated to `TimeZone`.

## Equality

Two booking availability policies are equal when all policy values are equal.

## Domain Errors

- `BookingAvailabilityPolicyInvalid`
- `BookingDateTooFarInFuture`
- `BookingMinimumNoticeNotMet`
- `BookingBufferInvalid`
