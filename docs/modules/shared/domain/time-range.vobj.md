# Time Range

> File name: `time-range.vobj.md`

## Purpose

Represents a canonical start/end interval and centralizes range validation and
overlap rules.

This value is used by selected slots, calendar blocks, manual blocks, booking
holds, and availability checks.

## Value

- `startAt`: canonical instant when the range starts.
- `endAt`: canonical instant when the range ends.

## Creation Rules

- `startAt` must be present.
- `endAt` must be present.
- `endAt` must be after `startAt`.

## Normalization

- Store canonical instants in one agreed representation.
- Local display values are derived outside this value object using `TimeZone`.

## Equality

Two time ranges are equal when both canonical instants are equal.

## Domain Errors

- `TimeRangeInvalid`
- `TimeRangeEndBeforeStart`

## Open Questions

- Should adjacent ranges count as non-overlapping when one ends exactly when the
  next starts?

## Overlap Rule

Two ranges overlap when:

```txt
new.startAt < existing.endAt
existing.startAt < new.endAt
```

Adjacent ranges where `new.startAt == existing.endAt` do not overlap.
