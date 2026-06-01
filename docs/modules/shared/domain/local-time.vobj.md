# Local Time

> File name: `local-time.vobj.md`

## Purpose

Represents a local business time without date or time zone.

## Value

- `value`: time in canonical `HH:mm` or `HH:mm:ss` form.

## Creation Rules

- Must be a valid local time.
- Must not contain a date or time zone.
- Booking slot policies can restrict allowed granularity.

## Normalization

- Store in canonical 24-hour format.
- Display formatting is handled outside the value object.

## Equality

Two local times are equal when their canonical time values are equal.

## Domain Errors

- `LocalTimeInvalid`
- `LocalTimeMissing`

## Open Questions

- Should seconds ever be supported, or should booking always use minute-level
  precision?
