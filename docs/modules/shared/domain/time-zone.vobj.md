# Time Zone

> File name: `time-zone.vobj.md`

## Purpose

Represents the IANA time zone used to convert between business local dates/times
and canonical instants.

## Value

- `value`: supported IANA time zone.

## Creation Rules

- Must be an accepted IANA time zone.
- Launch business time zone is expected to be `Europe/Madrid`.
- User supplied arbitrary time zones should not be accepted for booking
  calculations unless explicitly supported.

## Normalization

- Trim surrounding whitespace.
- Store canonical IANA casing.

## Equality

Two time zones are equal when their canonical values are equal.

## Domain Errors

- `TimeZoneUnsupported`
- `TimeZoneMissing`

## Open Questions

- Should public display ever adapt to the visitor's local time zone, or always
  show boat-local time?
