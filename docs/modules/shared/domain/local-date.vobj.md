# Local Date

> File name: `local-date.vobj.md`

## Purpose

Represents a business date without time, evaluated in a known time zone.

## Value

- `value`: date in canonical `YYYY-MM-DD` form.

## Creation Rules

- Must be a valid calendar date.
- Must not contain time or time zone information.
- Use cases can decide whether past dates are allowed.

## Normalization

- Store as `YYYY-MM-DD`.
- Display formatting is handled outside the value object.

## Equality

Two local dates are equal when their canonical date values are equal.

## Domain Errors

- `LocalDateInvalid`
- `LocalDateMissing`

## Open Questions

- Should booking public availability reject dates beyond a configured future
  window?
